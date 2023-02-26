const GP_SIGN = {
    "ＡＡ" : 4,
    "Ａ" : 3,
    "Ｂ" : 2,
    "Ｃ" : 1,
    "Ｄ" : 0
}

function createTd(text, attribute=null, whiteSpace=null){
    tmp_td = document.createElement("td");
    tmp_td.innerText = text;
    tmp_td.setAttribute(attribute[0], attribute[1]);
    tmp_td.style.whiteSpace = whiteSpace
    return tmp_td;
}

function updateGp(year, semester, gp, units){

    if(year in data === false){
        data[year] = {
            "GP_y"      : 0,
            "units_y" : 0,
            "details"   : {}
        }
    }
    data[year]["GP_y"]      += gp
    data[year]["units_y"] += units

    let details = data[year]["details"]
    if(semester){
        if(semester in details === false){
            details[semester] = {
                "semester"  : semester,
                "GP_s"      : 0,
                "units_s" : 0,
            }
        }
        details[semester]["GP_s"]      += gp
        details[semester]["units_s"] += units
    }
}

// 全角数字を半角数字に変換してくれる関数
// https://www.yoheim.net/blog.php?q=20191101 より
function hankaku2Zenkaku(str) {
    return str.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// 数字の成績をアルファベットの成績に変換する関数
function numgrade_to_lettergrade(str) {
    const gradenum = Number(hankaku2Zenkaku(str));
    if(gradenum < 60){
        return "Ｄ";
    }
    else if(gradenum < 70){
        return "Ｃ";
    }
    else if(gradenum < 80){
        return "Ｂ";
    }
    else if(gradenum < 90){
        return "Ａ";
    }
    else{
        return "ＡＡ";
    }
}

function setIdsLabalTd(element, idtext){
    console.log(element)
    element.querySelector("label").id = idtext
    element.querySelector("label > input").id = idtext
}

const data = {};

/*
    data = {<year>:<year_data>, <year>:<year_data>, ..., <"その他">:<others>}
        * <year : num> must be in [2022, 2021, 2020, 2019, etc ...]

        <year_data> = {
            "GP_y"      : <GP : num>,
            "units_y" : <units : num>,
            "details"   : {<semester_data>, ...}
        }

            <semester_data> = {
                "semester"  : <semester : str>
                "GP_s"      : <GP : num>,
                "units_s" : <units : num>,
            }

                <semester> must be in ["前期", "後期", "通年", "その他"]

        <others> has the same format as <year_data>,
*/


window.addEventListener("load",function() {

    // -=-=-= calc GPA =-=-=-
    const grades = document.querySelectorAll("#main > form > div > table > tbody > .column_odd");
    let total_GP = 0;
    let total_units = 0;

    for(const grade of grades){
        let exception_units = false;

        // --- get necessary data
        let gpsign  =        grade.querySelector("td:nth-child(6)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let units   = Number(grade.querySelector("td:nth-child(4)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), ""));
        let teacher =        grade.querySelector("td:nth-child(2)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let year    =        grade.querySelector("td:nth-child(7)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let half    =        grade.querySelector("td:nth-child(8)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
            // half will be one of ("前期", "前期集中", "後期", "後期集中", "通年", "通年集中", etc...)

        let semester = null
        if(half.match("前期")){
            semester = "前期"
        }else if(half.match("後期")){
            semester = "後期"
        }else if(half.match("通年")){
            semester = "通年"
        }else{
            semester = "その他"
        }

        // --- check whether the data is valid
        try{
            year = Number(year)
        }catch{
            // if year is not a number, or can not be transformed to number
            exception_units = true;
        }
        if(!teacher){
            // if teacher is empty
            exception_units = true;
        }

        // --- convert gp_sign to gp
        // 数字で成績が書かれていたらアルファベットの形式に直す
        if (/[０-９]/.test(gpsign)){
            gpsign = numgrade_to_lettergrade(gpsign);
        }
        // 数字でもアルファベットでもなかったら無視
        if (GP_SIGN[gpsign] == undefined){
            continue;
        }
        let gp = GP_SIGN[gpsign] * units

        // --- sum for total
        total_GP += gp;
        total_units += units;

        // --- sum for each year and semester
        if(!exception_units){
            updateGp(year, semester, gp, units);
        }else{
            updateGp("その他", "その他", gp, units);
        }
    }

    // check in console.
    console.log(data)


    // -=-=-= display =-=-=-
    const target = document.querySelector("#main > form > div:nth-child(7) > div");

    // navi
    const navi = document.querySelector("#tabnavigation_list").cloneNode(true);;
          navi.querySelector("ul > li").innerText = "GPAを確認する"

    //table-definition
    const gpa_table = document.createElement("table");
          gpa_table.classList.add("list");
          gpa_table.style.setProperty("margin-top", "0px")
          gpa_table.style.setProperty("margin-left", "20px")
          gpa_table.style.setProperty("border", "1px solid #777777")
    const header = document.createElement("tr");
          header.classList.add("label")
    const gpa_tbody = document.createElement("tbody");
    const footer = document.createElement("tr");
          footer.classList.add("label")

    const CHECK_TD = createTd(text=null, attribute=["align", "center"], whiteSpace="nowrap");
          CHECK_TD.style.setProperty("width", "0")
          CHECK_TD.style.setProperty("white-space", "nowarp")
    const CHECK_LB = document.createElement("label")
    const CHECK_IN = document.createElement("input")
    CHECK_IN.type = "checkbox"
    CHECK_IN.setAttribute("align", "center")
    CHECK_LB.appendChild(CHECK_IN)
    CHECK_TD.appendChild(CHECK_LB)

    // table-header
    let check_td = CHECK_TD.cloneNode(true);
    setIdsLabalTd(check_td, "overall")
    header.appendChild(check_td)

    for(const i_text of ["セメスター", "GPA", "単位取得数"]){
        const td = createTd(text=i_text, attribute=["align", "center"], whiteSpace="nowrap")
        header.appendChild(td)
    }
    gpa_tbody.append(header)

    // table-body
    const keys_y = Object.keys(data).sort();
    for(const data_y of keys_y){

        // year (overall of the semester)
        let tmp_tr_y = document.createElement("tr");
            tmp_tr_y.classList.add("column_even")
        let year_GP    = data[data_y]["GP_y"]
        let year_units = data[data_y]["units_y"]
        let year_GPA   = (Math.floor(year_GP*100/year_units)/100).toFixed(2)

        let check_td = CHECK_TD.cloneNode(true);
        setIdsLabalTd(check_td, "label" + data_y)
        tmp_tr_y.appendChild(check_td)

        for(const i_text of [data_y, year_GPA, year_units]){
            const td = createTd(text=i_text, attribute=["align", "center"])
            tmp_tr_y.appendChild(td)
        }
        gpa_tbody.appendChild(tmp_tr_y);

        // semester
        let keys_s = Object.keys(data[data_y]["details"]).sort();
        for(const data_s of keys_s){
            let tmp_tr_s = document.createElement("tr");
            let semester_GP    = data[data_y]["details"][data_s]["GP_s"];
            let semester_units = data[data_y]["details"][data_s]["units_s"];
            let semester_GPA   = (Math.floor(semester_GP*100 / semester_units)/100).toFixed(2);
            for(const i_text of ["", data_s, semester_GPA, semester_units]){
                const td = createTd(text=i_text, attribute=["align", "center"])
                tmp_tr_s.appendChild(td)
            }
            gpa_tbody.appendChild(tmp_tr_s);

        }
    }

    // table-footer
    const total_gpa = (Math.floor(total_GP * 100 / total_units)/100).toFixed(2);
    for(const i_text of ["", "通算", total_gpa, total_units]){
        const td_foot = createTd(text=i_text, attribute=["align", "center"], whiteSpace="nowrap")
        footer.append(td_foot)
    }
    gpa_tbody.append(footer)

    // table-overall
    gpa_table.appendChild(gpa_tbody)

    // <br>
    const br_element = document.createElement("br");

    target.before(navi);
    target.before(gpa_table);
    target.before(br_element);

})