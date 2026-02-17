async function fetchData(url){
    try{
        const response=await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch{
        console.error("Error: loading json file");
    }
}

var companyName="";
var dataFiltered=[]

var filters=[];



async function makeTableHeader(jsonData){
    let tableHeader=document.getElementById("table-header");
    let totalQues=jsonData["survey"]["questions"].length;

    let name=document.createElement('div');
    name.classList.add('header-name');
    name.classList.add("table-cell");
    name.classList.add('header-cell');
    name.innerText="NAME";
    tableHeader.appendChild(name);
    
    let email=document.createElement('div');
    email.classList.add('header-email');
    email.classList.add("table-cell");
    email.classList.add('header-cell');
    email.innerText="EMAIL";
    tableHeader.appendChild(email);
    
    let country=document.createElement('div');
    country.classList.add('header-country');
    country.classList.add("table-cell");
    country.innerText="COUNTRY";
    country.classList.add('header-cell');
    tableHeader.appendChild(country);
    
    let date=document.createElement('div');
    date.classList.add('header-date');
    date.classList.add("table-cell");
    date.innerText="DATE";
    date.classList.add('header-cell');
    tableHeader.appendChild(date);
    
    
    for (var i=0;i<totalQues;i++){
        let ques=document.createElement('div');
        ques.classList.add('header-ques');
        ques.classList.add("table-cell");
        ques.classList.add('header-cell');
        ques.innerText=`Q${i+1} RATING`;
        tableHeader.appendChild(ques);
    }
    let avg=document.createElement('div');
    avg.classList.add('header-avg');
    avg.classList.add("table-cell");
    avg.classList.add('header-cell');
    avg.innerText=`AVG RATING`;
    tableHeader.appendChild(avg);
}


async function filterOnce(){
    const jsonData=await fetchData('src/data.json');
    await createFilter(jsonData);
    await updateGlobal(jsonData);
    await makeTableHeader(jsonData);
    await updateSurveyName(jsonData);
}
filterOnce();


async function createFilter(jsonData) {
    const filterParam=jsonData["filter"];
    var paramValues=[];
    let paramData=jsonData["responses"];
    for (var i=0;i<paramData.length;i++){
        paramValues.push(paramData[i][filterParam]);
    }
    const setFilter=new Set(paramValues);
    await createListner(setFilter);
}

async function createListner(filterSet) {
    let filterArr=[...filterSet];
    filterArr.sort();
    let filter=document.getElementById('filter');
    for (const val of filterArr){
        filters.push(val);
        let parent=document.createElement('div');
        let filterVal=document.createElement('input');
        let label=document.createElement('label');
        filterVal.type='checkbox';
        filterVal.name='filter';
        filterVal.id=val.toString();
        filterVal.value=val;
        filterVal.classList.add('filter-value');
        filterVal.checked=true;
        label.appendChild(filterVal);
        label.appendChild(document.createTextNode(`${val}`));
        parent.appendChild(label);
        filter.appendChild(parent);

        filterVal.addEventListener('change',()=>{
            if (filters.includes(val)){
                filters=filters.filter(item=>item!=val);
            }
            else{
                filters.push(val);
            }
            filterData();
        })
    }

}

async function updateSurveyName(jsonData){
    const appTitle=document.getElementById('app-title');
    appTitle.innerText="SURVEY ANALYZER | "+jsonData["survey"]["survey_name"];
}

async function filterData(){

    const jsonData=await fetchData('../src/data.json');

    const responses=jsonData["responses"];
    dataFiltered=[]
    const filterCol=jsonData["filter"];
    for (var i=0;i<responses.length;i++){
        if (!filters.includes(responses[i][filterCol])){
            dataFiltered.push(responses[i]);
        }
    }
    
    console.log(dataFiltered);
    await update(jsonData);
}

filterData();

async function updateGlobal(jsonData){
    companyName=jsonData["company_name"];
    const company=document.getElementById('company-name');
    company.innerText=companyName;
    const date=document.getElementById('date');
    let open=jsonData['survey']["open_date"];
    let close=jsonData['survey']['close_date'];
    date.innerHTML=`Opening Date: ${open} <br> Closing Date: ${close}`;
    let totalRes=jsonData["responses"].length;
    document.getElementById('response').innerText=`${totalRes}`;
    let nameSurvey=jsonData["survey"]["survey_name"];
    document.getElementById('Survey-Name').innerText=nameSurvey;
    await updateRatings(jsonData);
    await updateQuesRatings(jsonData);

}

async function updateRatings(jsonData){
    let data=jsonData["responses"];
    if (data.length>0){
        let total=0;
        let count1=0;
        let count2=0;
        let count3=0;
        let count4=0;
        let count5=0;
        const totalQues=jsonData["survey"]["questions"].length;
        for (var q=0;q<totalQues;q++){
            const currentQues=`q${q+1}_rating`
            for (var i=0;i<data.length;i++){
                total+=data[i][currentQues];
                switch (data[i].q1_rating){
                    case 1:
                        count1++;
                        break;
                    case 2:
                        count2++
                        break;
                    case 3:
                        count3++;
                        break;
                    case 4:
                        count4++;
                        break;
                    case 5:
                        count5++;
                        break;
                }
                
            }
        }
        let overallRating=total/(data.length*totalQues);
        let ratingDiv=document.getElementById('ratings');
        ratingDiv.innerHTML=`<p>${overallRating.toFixed(2)}/5 </p>`
        let titleDiv=document.createElement('div');
        titleDiv.classList.add("kpi-heading");
        titleDiv.innerText="OVERALL RATING";
        ratingDiv.appendChild(titleDiv);
        
        const ctx = document.getElementById('myBarChart').getContext('2d');
        
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
                label: '# of ratings',
                data: [count1, count2, count3, count4, count5],
                borderWidth: 1,
                backgroundColor: [
                '#ff4d4d',  // 1 star - red
                '#ff944d',  // 2 stars - orange
                '#ffd11a',  // 3 stars - yellow
                '#66cc66',  // 4 stars - light green
                '#2ecc71'   // 5 stars - green
                ],
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true,
                title :{
                    display: true,
                    text: 'Number of Ratings'
                }
                }
            }
            }
        });

        
    }
    
}

async function update(jsonData){
    await updateTable(jsonData);
}

async function updateQuesRatings(jsonData){
    let totalQues=jsonData["survey"]["questions"].length;
    const  answer=document.getElementById('answers');
    for (var i=0;i<totalQues;i++){
        const parent=document.createElement('div');
        let quesText=jsonData["survey"]["questions"][i]["text"];
        const ques=document.createElement('div');
        ques.innerText=quesText;
        ques.classList.add('question-text');
        let quesVar='q'+(i+1)+"_rating";
        let quesRes=jsonData["responses"];
        let totalRating=0;
        for (var j=0;j<quesRes.length;j++){
            totalRating+=quesRes[j][quesVar];
        }
        let avgScore=totalRating/quesRes.length
        const questionRating=document.createElement('div');
        questionRating.classList.add('question-rating');
        questionRating.innerText=`AVG Rating: ${avgScore}`;
        parent.classList.add('question-container');
        parent.appendChild(ques);
        parent.appendChild(questionRating);
        answer.appendChild(parent);
    }
}


async function updateTable(jsonData){
    console.log("working");
    let table=document.getElementById("data-table");
    let fullData=jsonData["responses"];
    let displayData;
    if (dataFiltered.length==0){
        displayData=fullData;
    }
    else{
        displayData=fullData.filter(item=>!dataFiltered.includes(item));
    }
    let totalQues=jsonData["survey"]["questions"].length;
    let tableRows=document.getElementById('table-rows');
    tableRows.innerHTML="";
    
    for (var item=0;item<displayData.length;item++){
        let entry=displayData[item];
        let row=document.createElement('div');
        row.classList.add('table-row');

        let name=document.createElement('div');
        name.classList.add('table-name');
        name.classList.add("table-cell");
        name.innerText=entry["name"];
        row.appendChild(name);

        let email=document.createElement('div');
        email.classList.add('table-email');
        email.classList.add("table-cell");
        email.innerText=entry["email"];
        row.appendChild(email);

        let country=document.createElement('div');
        country.classList.add('table-country');
        country.classList.add("table-cell");
        country.innerText=entry["country"];
        row.appendChild(country);
        
        let date=document.createElement('div');
        date.classList.add('table-date');
        date.classList.add("table-cell");
        const month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
        let currMonth=entry["date"].slice(5,7);
        let formatedDate="";
        formatedDate=formatedDate+month[parseInt(currMonth)-1]+" "+parseInt(entry["date"].slice(8,10))+",";
        date.innerText=formatedDate;
        row.appendChild(date);
        
        let total=0;
        for (var i=0;i<totalQues;i++){
            let ques=document.createElement('div');
            ques.classList.add('table-ques');
            ques.classList.add("table-cell");
            let str=`q${i+1}_rating`;
            ques.innerText=entry[str];
            row.appendChild(ques);
            total+=entry[str];
        }
        total=total/totalQues;
        let avg=document.createElement('div');
        avg.classList.add('table-avg');
        avg.classList.add("table-cell");
        avg.innerText=total.toFixed(1);
        row.appendChild(avg);
        
        
        tableRows.appendChild(row);

    }
    console.log("table added");
    
}