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

function updateGp(semester, gp, credit){
    if(semester in data === false){
        data[semester] = {"GP": 0, "credits": 0}
    }
    data[semester]["GP"] += GP_SIGN[gp] * credit;
    data[semester]["credits"] += credit;
}

const data = {};

window.addEventListener("load",function() {

    const grades = document.querySelectorAll("#main > form > div > table > tbody > .column_odd");
    let total_GP = 0;
    let total_credits = 0;

    for(const grade of grades){
        gp      = grade.querySelector("td:nth-child(6)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        credit  = Number(grade.querySelector("td:nth-child(4)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), ""));
        teacher = grade.querySelector("td:nth-child(2)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        year    = grade.querySelector("td:nth-child(7)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");
        half    = grade.querySelector("td:nth-child(8)").innerText.replace(String.fromCodePoint(160), "").replace(String.fromCodePoint(32), "");

        if (GP_SIGN[gp] == undefined){continue;}
        total_GP += GP_SIGN[gp] * credit;
        total_credits += credit;

        if(teacher != ""){
            semester = year + " " +  half; // semester : <string>
            updateGp(semester, gp, credit);
        }else{
            updateGp("その他", gp, credit);
        }
    }

    const target = document.querySelector("#main > form > div:nth-child(7) > div");

    // navi
    navi = document.querySelector("#tabnavigation_list").cloneNode(true);;
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
          footer.classList.add("column_even")

    // table-header
    for(const i_text of ["セメスター", "GPA", "単位取得数"]){
        const td = createTd(text=i_text, attribute=["align", "center"], whiteSpace="nowrap")
        header.appendChild(td)
    }
    gpa_tbody.append(header)

    // table-body
    const keys = Object.keys(data).sort();
    for(const row of keys){
        tmp_tr = document.createElement("tr");
        semester_GPA = (Math.floor(data[row]["GP"]*100 / data[row]["credits"])/100).toFixed(2);
        for(const i_text of [row, semester_GPA, data[row]["credits"]]){
            const td = createTd(text=i_text, attribute=["align", "center"])
            tmp_tr.appendChild(td)
        }
        gpa_tbody.appendChild(tmp_tr);
    }

    // table-footer
    total_gpa = (Math.floor(total_GP * 100 / total_credits)/100).toFixed(2);
    for(const i_text of ["通算", total_gpa, total_credits]){
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