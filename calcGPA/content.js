GP_SIGN = {
    "ＡＡ" : 4,
    "Ａ" : 3,
    "Ｂ" : 2,
    "Ｃ" : 1,
    "Ｄ" : 0
}

window.addEventListener("load",function() {

    grades = document.querySelectorAll("#main > form > div > table > tbody > .column_odd");
    data = {};
    total_GP = 0;
    total_credits = 0;

    for(const grade of grades){

        // GP : grade point
        gp = grade.querySelector("td:nth-child(6)").innerText.replace(String.fromCodePoint(160), '').replace(String.fromCodePoint(32), '');
        // credit
        credit = grade.querySelector("td:nth-child(4)").innerText.replace(String.fromCodePoint(160), '').replace(String.fromCodePoint(32), '');
        credit = Number(credit)

        total_GP += GP_SIGN[gp] * credit;
        if (GP_SIGN[gp] == undefined){
            continue;
        }
        total_credits += credit;


        // teacher
        teacher = grade.querySelector("td:nth-child(2)").innerText.replace(String.fromCodePoint(160), '');

        if(teacher != ""){

            // year
            year = grade.querySelector("td:nth-child(7)").innerText.replace(String.fromCodePoint(160), '');
            // first or last half
            half = grade.querySelector("td:nth-child(8)").innerText.replace(String.fromCodePoint(160), '');

            semester = year + half;
            if (semester in data === false){
                data[semester] = {
                    'GP' : GP_SIGN[gp] * credit,
                    'credits' : credit
                }
            }else{
                data[semester]['GP'] += GP_SIGN[gp] * credit;
                data[semester]['credits'] += credit;
            }
        }
    }

    var target = document.querySelector("#main > form > div:nth-child(7) > div");
    var br_element = document.createElement('br');
    navi = document.querySelector("#tabnavigation_list").cloneNode(true);;
    navi.querySelector("ul > li").innerText = "GPAを確認する"


    var gpa_table = document.createElement('table');
    var gpa_tbody = document.createElement('tbody');


    var header = document.createElement("tr");
    header.classList.add("label")
    var head1 = document.createElement('td');
    var head2 = document.createElement('td');
    var head3 = document.createElement('td');
    head1.innerText = 'セメスター'
    head2.innerText = 'GPA'
    head3.innerText = '取得単位数'
    head1.setAttribute("align", "center");
    head2.setAttribute("align", "center");
    head3.setAttribute("align", "center");
    head1.style.whiteSpace = 'nowrap';
    head2.style.whiteSpace = 'nowrap';
    head3.style.whiteSpace = 'nowrap';
    header.appendChild(head1)
    header.appendChild(head2)
    header.appendChild(head3)
    gpa_tbody.append(header)


    for(row in data){
        tmp_tr = document.createElement('tr');
        semester_GPA = (Math.floor(data[row]['GP']*100 / data[row]['credits'])/100).toFixed(2);
        td_sms = document.createElement('td');        // SeMeSter
        td_gpa = document.createElement('td');
        td_crd = document.createElement('td');
        td_sms.innerHTML = row
        td_gpa.innerHTML = semester_GPA
        td_crd.innerHTML = data[row]['credits']
        td_sms.setAttribute("align", "center");
        td_gpa.setAttribute("align", "center");
        td_crd.setAttribute("align", "center");
        tmp_tr.appendChild(td_sms);
        tmp_tr.appendChild(td_gpa);
        tmp_tr.appendChild(td_crd);
        gpa_tbody.appendChild(tmp_tr);
    }


    var footer = document.createElement("tr");
    footer.classList.add("column_even")
    var foot1 = document.createElement('td');
    var foot2 = document.createElement('td');
    var foot3 = document.createElement('td');
    foot1.innerText = '通算'
    foot2.innerText = (Math.floor(total_GP * 100 / total_credits)/100).toFixed(2);
    foot3.innerText = total_credits
    foot1.setAttribute("align", "center");
    foot2.setAttribute("align", "center");
    foot3.setAttribute("align", "center");
    foot1.style.whiteSpace = 'nowrap';
    foot2.style.whiteSpace = 'nowrap';
    foot3.style.whiteSpace = 'nowrap';
    footer.appendChild(foot1)
    footer.appendChild(foot2)
    footer.appendChild(foot3)
    gpa_tbody.append(footer)


    gpa_table.classList.add("list");
    gpa_table.style.setProperty("margin-top", "0px")
    gpa_table.style.setProperty("margin-left", "20px")
    gpa_table.style.setProperty("border", "1px solid #777777")
    gpa_table.appendChild(gpa_tbody)


    target.before(navi);
    target.before(gpa_table);
    target.before(br_element);

})

//p2_element.before(new_element1);
