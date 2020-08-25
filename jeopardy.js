let categories = [];
const NUM_QUESTIONS_PER_CAT = 5;


/*Get 100 categories from API, create an array containing their ids and return first 6 category ids from the shuffled array*/

async function getCategoryIds() {
  let listOfCategories= await axios.get(`http://jservice.io/api/categories`, {params: {count: 100}})
  for(let category of listOfCategories.data){
    categories.push(category.id);
  }
  arrayShuffle(categories);
  categories.splice(6);
  return categories;
}

/* This function returns and object with data about a category (title, array of clues objects and showing keys)*/
 
async function getCategory(catId) {
  let categoryObjResponse= await axios.get(`http://jservice.io/api/category`, {params: {id: catId}})
  categoryObj = {
    title: categoryObjResponse.data.title,
    clues: categoryObjResponse.data.clues,
    showing: null
  };
  return categoryObj;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  categories=await getCategoryIds();
  let questionAnswer="?";
  
  $('#jeopardy').append('<thead><tr>')
  $('#jeopardy').append('<tbody>');
  
  for(let i=0;i<categories.length;i++){
    let categoryObj=await getCategory(categories[i]);
    $('tr').append(`<th id= header${i}>${categoryObj.title}</td>`)
  }
    
  for(let i=0; i< NUM_QUESTIONS_PER_CAT;i++){
    let row=$('<tr>');   

    for(let j=0;j<categories.length;j++){
      let cell=$(`<td id=${i}-${j}>${questionAnswer}</td>`)
      console.log("Cell :" +cell);
      cell.attr("showing","null");
      // jQuery.data( div, "test", {
      //     first: 16,
      //     last: "pizza!"
      //   });
      row.append(cell);
    } 
    $('tbody').append(row)
  }
  $('body tr td').on('click',async function(evt){
    handleClick(evt)
  } )
  hideLoadingView();     
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if curerntly "answer", ignore click
 * */

async function handleClick(evt) {
  let currentID = evt.target.id;
  let columnIndx=evt.target.id[2]
  let rowIndx=evt.target.id[0]
  let categoryId=categories[columnIndx];
  let  categoryObj= await getCategory(categoryId);
  let question=categoryObj.clues[rowIndx].question;
  let answer=categoryObj.clues[rowIndx].answer;
  
  let showingStatus= evt.target.getAttribute('showing');
  if(showingStatus==="null"){
    $("#"+currentID).html(question);
    $("#"+currentID).attr('showing','question');
  }else if(showingStatus==="question"){
    $("#"+currentID).html(answer);
    $("#"+currentID).css('background-color','#8d2ab8');

    $("#"+currentID).attr('showing','answer');
  }else{
    return;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

async function showLoadingView() {
  $('button').html('Loading..');
  $('#loading').append('<i class="fas fa-spinner fa-spin icon-large"></i>');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {

  $('button').html('Restart')
  $('#loading').hide();
  $('#start').attr('status','loaded'); 
}

async function setupAndStart() {
  await fillTable();
}

/** On click of start / restart button, set up game. */
$('button').on('click', async function(){
  if($('#start').attr('status') === 'loaded')
    $('#container').empty();
    $('#container').append('<p id="loading"></p>');
    $('#container').append('<table id="jeopardy"></table>');
  showLoadingView()
  setupAndStart();
});

function arrayShuffle(arr){
  var takenIndices=[];

  for(var i=0;i<arr.length-1;i++){
  
    if(takenIndices.includes(i)){
      continue; 
    }else{
      takenIndices.push(i);
    }
    var randIndex=Math.floor(Math.random() *arr.length);
    
    while(takenIndices.includes(randIndex)&&takenIndices.length<arr.length){
      randIndex=Math.floor(Math.random() *arr.length);
    }
    var temp=arr[i];
    arr[i]=arr[randIndex];
    arr[randIndex]=temp;
  }
  return arr;
}