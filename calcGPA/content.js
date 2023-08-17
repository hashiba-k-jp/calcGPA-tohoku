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

function change_display(args){
    toggle_img = document.querySelector("#toggle-"+this.id);
    if(toggle_img.className == "toggle-visible"){
        toggle_img.src = chrome.runtime.getURL('images/toggle-off.svg');
    }else{
        toggle_img.src = chrome.runtime.getURL('images/toggle-on.svg');
    }
    toggle_img.classList.toggle("toggle-visible")

    targets = document.querySelectorAll(".changeble-display-"+this.id);
    for(t of targets){
        t.classList.toggle("invisible_content");
    }
}

window.addEventListener("load",function() {

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- Calculate GPA -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const grades_header = document.querySelector("#main > form > div > table > tbody > .label");
    for(let i = 1; i<=9; i++){
        grades_header.querySelector("td:nth-child("+String(i)+")").classList.add("changeble-display-"+String(i));
    }

    const grades = document.querySelectorAll("#main > form > div > table > tbody > .column_odd");
    let total_GP = 0;
    let total_units = 0;

    for(const grade of grades){
        let exception_units = false;

        // --- get necessary data
        let gpsign  =        grade.querySelector("td:nth-child(7)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let units   = Number(grade.querySelector("td:nth-child(5)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), ""));
        let teacher =        grade.querySelector("td:nth-child(3)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let year    =        grade.querySelector("td:nth-child(8)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        let half    =        grade.querySelector("td:nth-child(9)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        for(let i = 1; i<=9; i++){
            grade.querySelector("td:nth-child("+String(i)+")").classList.add("changeble-display-"+String(i));
        }
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


    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= display =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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

    const ACD_TD  = createTd(text=null, attribute=["align", "center"], whiteSpace="nowrap");
          ACD_TD.style.setProperty("white-space", "nowarp")
          ACD_TD.classList.add("accordion")
    const ACD_IMG = document.createElement("img")
          ACD_IMG.src = chrome.runtime.getURL('images/caret-right-fill.svg');
    const ACD_BTN = document.createElement("button")
          ACD_BTN.type = "button"
          ACD_BTN.value = "FALSE"
          ACD_BTN.classList.add(".acd_close")
          ACD_BTN.classList.add("acd_btn") // ACD stands for ACcorDion

    ACD_BTN.appendChild(ACD_IMG)
    ACD_TD.appendChild(ACD_BTN)

    // table-header
    /*
    let check_td = ACD_TD.cloneNode(true);
    header.appendChild(check_td)
    */

    for(const i_text of ["", "年度", "GPA", "単位取得数"]){
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
        let year_units = data[data_y]["units_y"].toFixed(1)
        let year_GPA   = (Math.floor(year_GP*100/year_units)/100).toFixed(2)

        let check_td = ACD_TD.cloneNode(true);
        check_td.querySelector("button").id = "year_" + data_y;
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
                tmp_tr_s.classList.add("tr_close")
                tmp_tr_s.classList.add("year_" + data_y)
            let semester_GP    = data[data_y]["details"][data_s]["GP_s"];
            let semester_units = data[data_y]["details"][data_s]["units_s"].toFixed(1);
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
    for(const i_text of ["", "通算", total_gpa, total_units.toFixed(1)]){
        const td_foot = createTd(text=i_text, attribute=["align", "center"], whiteSpace="nowrap")
        td_foot.style.backgroundImage = "none";
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

    for(const btn of document.querySelectorAll(".acd_btn")){
        // console.log(btn)
        btn.addEventListener('click', function(){
            targets_tr = btn.id
            console.log(targets_tr)

            if(btn.value === "TRUE"){   // To CLOSE
                btn.classList.add("acd_close")
                btn.classList.remove("acd_open")
                btn.value = "FALSE"
                for(const ele of document.querySelectorAll("." + targets_tr)){
                    console.log(ele)
                    ele.classList.add("tr_close")
                    ele.classList.remove("tr_open")
                }

            }else{                      // To OPEN
                btn.classList.add("acd_open")
                btn.classList.remove("acd_close")
                btn.value = "TRUE"
                for(const ele of document.querySelectorAll("." + targets_tr)){
                    console.log(ele)
                    ele.classList.add("tr_open")
                    ele.classList.remove("tr_close")
                }
            }
        });
    }


    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- display  settings -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    const settings_insertion_target = document.querySelector("#side_menu > .mid");
    const settings_insertion_ul = document.createElement("ul");
    const settings_insertion_label = document.createElement("li");
    settings_insertion_label.classList.add("label");
    settings_insertion_label.innerText = "表示設定"
    settings_insertion_ul.appendChild(settings_insertion_label);

    const SETTING_IMG_ON  = document.createElement("img")
          SETTING_IMG_ON.src  = chrome.runtime.getURL('images/toggle-on.svg');
    const SETTING_IMG_OFF = document.createElement("img")
          SETTING_IMG_OFF.src = chrome.runtime.getURL('images/toggle-off.svg');

    const settings_insertion_li = document.createElement("li");
    const settings_insertion_a = document.createElement("a");
    settings_insertion_a.appendChild(SETTING_IMG_ON);
    settings_insertion_li.appendChild(settings_insertion_a);

    const display_list = [
        ["メディア授業科目", 2],
        ["担当教員", 3],
        ["必修／選択", 4],
        ["得点", 6],
        ["評価", 7]
    ]

    for(const element of display_list){
        [tmp_text, tmp_num] = element;
        let tmp_li = settings_insertion_li.cloneNode(true);
        tmp_li.classList = "item";
        tmp_li.querySelector("img").classList = "toggle-visible"
        tmp_li.querySelector("img").id = "toggle-"+tmp_num
        tmp_li.querySelector("a").insertAdjacentText('beforeend', tmp_text);
        tmp_li.querySelector("a").id = tmp_num;
        tmp_li.querySelector("a").classList = "visible";
        tmp_li.querySelector("a").addEventListener("click", change_display);
        settings_insertion_ul.appendChild(tmp_li);
    }

    settings_insertion_target.appendChild(settings_insertion_ul);

})
