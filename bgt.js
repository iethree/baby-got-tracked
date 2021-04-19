// js
let records = [];
let summary = {};
let mode = localStorage.mode || 'record';

const TIME_FORMAT = "h:mm a";
const DATE_FORMAT = 'dddd MMMM D';
const icons = {
  'left': `<span class="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" />
</svg></span>`,
  'right': `<span class="text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
</svg></span>`,
  'poop': '💩',
  'pee': `<span class="text-yellow-500"><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
  class="w-4 h-4 inline" viewBox="0 0 572.8 572.801" style="enable-background:new 0 0 572.8 572.801;"
  fill="currentColor"
  xml:space="preserve">
<path d="M520.25,353.6c0,125-100.5,219.201-233.8,219.201S52.55,478.6,52.55,353.6c0-115.3,164.7-301.5,197.7-337.7
   c9.3-10.2,22.4-15.9,36.2-15.9s26.9,5.8,36.2,15.9C355.55,52.1,520.25,238.4,520.25,353.6z"/>
</svg> </span>`,
};

load();
updateTime();
setInterval(updateTime, 1000 * 5);
draw(mode);


document.querySelectorAll('button.button').forEach(el=>el.addEventListener('click', record));
document.querySelector('#mode-switch').addEventListener('click', switchMode);


// store data locally: no data transmission
function record(el) {
  const type = el?.currentTarget?.dataset?.type;
  if (!type) {
    return;
  }

  records.unshift({id: uuid(), type, time: new Date().toISOString() });
  saveRecords();
  draw(mode);
}

function saveRecords(){
  records.sort((a,b) => a.time < b.time ? 1 : -1);
  localStorage.setItem('data', JSON.stringify(records));
}

function getSummary(){
  const summary = {};
  records.forEach(r => {
    const dateString = dayjs(r.time).format('YYYYMMDD');
    if (!summary[dateString]) {
      summary[dateString] = {poop: 0, pee: 0, left: 0, right: 0};
    }
    summary[dateString][r.type]++;

  });
  return summary;
}

// load data from local device, if any exists
function load() {
  if (localStorage.data) {
    records = JSON.parse(localStorage.data);
  }
}


function switchMode() {
  mode = mode === 'summary' ? 'records' : 'summary';
  localStorage.setItem('mode', mode);
  draw(mode);
  // animate 
  setTimeout(
    ()=>{
      document.querySelectorAll('.scale-0').forEach(el=>el.classList.remove('scale-0'));
      document.querySelectorAll('tr.-translate-y-4').forEach(el=>el.classList.remove('-translate-y-4'));
    }, 10);
  drawTimeSinceLastEvent();
}

function draw(mode) {
  if (mode === 'summary') {
    document.getElementById('mode-switch').classList.remove('text-gray-700');
  } else {
    document.getElementById('mode-switch').classList.add('text-gray-700');
  }

  mode === 'summary' ? drawSummary() : drawRecords();
}

function drawRecords() {
  const table = records?.length
    ? `
      ${records.map(drawRecord).join('')}
    </table>
  ` : '<div class="p-10">No Records</div>';

  document.getElementById('data-table').innerHTML = table;
  
}

function drawSummary() {
  const days = getSummary();
  const dates = Object.keys(days).sort().reverse();

  const table = dates?.length
    ? `<table class="striped w-full text-center text-lg transition transform origin-bottom">
      ${dates.map(d=>drawStats(d, days[d])).join('')}
    </table>`
    : '<div class="p-10">No Records</div>';

  document.getElementById('data-table').innerHTML = table;
}

function drawStats(date, data) {
  return `
  <tr>
    <td colspan="2" class="pt-3 pb-1 text-sm text-gray-400">${dayjs(date).format(DATE_FORMAT)}</td>
  </tr>
  <tr>
    <td>${icons.left} / ${icons.right}</td>
    <td>${data.left} / ${data.right}</td>
  </tr>
  <tr>
    <td>${icons.poop}</td>
    <td>${data.poop}</td>
  </tr>
  <tr>
    <td>${icons.pee}</td>
    <td>${data.pee}</td>
  </tr>`;
}

function drawRecord(record, index) {
  if(!record?.type || !record?.time) return '';

  let separator = '';
  if (index === 0 || dayjs(records[index-1].time).format('YYYYMMDD') != dayjs(record.time).format('YYYYMMDD')) {
    separator = `</table><table class="striped w-full text-center">
      <tr>
        <td colspan="2" class="bg-gray-700 pt-3 pb-1 text-sm text-gray-400">${dayjs(record.time).format(DATE_FORMAT)}
        </td>
      </tr>`;
  }

  return `${separator}
    <tr data-id="${record.id}" 
      class="selectable-row mb-2 text-lg transition transform origin-bottom ${index === 0 ? 'scale-0' : '-translate-y-4'}" 
      onclick="editModal(${index})"
    >
      <td class="px-5">${icons[record.type]}</td>
      <td>${dayjs(record.time).format(TIME_FORMAT)}</td>
    </tr>`;

}

function drawTimeSinceLastEvent(){
  if(records?.length && records[0]?.time) {
    document.getElementById('time-since')
      .innerText = 'updated ' + dayjs().to(dayjs(records[0].time));
  }
}

function uuid(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

function updateRecordFromGui(index){
  const type = document.querySelector('#edit-form > select[name="type"]')?.value;
  const date = document.querySelector('#edit-form > input[name="date"]')?.value;

  if(type && date && records[index].id) {
    editRecord(records[index].id, type, date);
    hideModal();
  }
}

function editRecord(id, type, date) {
  const toUpdate = records.findIndex((i)=>i.id === id);
  if (toUpdate === -1) {
    return;
  }
  records[toUpdate] = {id, type, time: dayjs(date).toISOString()};
  saveRecords();
  drawRecords();
}

function deleteRecord(id) {
  const toDelete = records.findIndex((i)=>i.id === id);
  if (toDelete === -1) {
    return;
  }
  records.splice(toDelete, 1);
  saveRecords();
  drawRecords();
  hideModal();
}

function editModal(index) {
  const record = records[index];

  console.log(record);

  showModal(`
      <h3 class="font-bold text-xl">Edit Record</h3>
      <div id="edit-form" class="my-5 text-lg" >
        <select name="type">
          ${['left', 'right', 'pee', 'poop'].map(o => (
            `<option ${o === record.type ? 'selected' : ''}>${o}</option>`
          )).join('')}
        </select>
        <input
          class="my-5"
          type="datetime-local"
          name="date" 
          value="${dayjs(record.time).format('YYYY-MM-DDTHH:mm')}"
        >
      </div>
      <div class="mt-5 flex justify-between">
        <button class="button" onclick="hideModal()">cancel</button>
        <button class="button red" onclick="deleteRecord('${record.id}')">delete</button>
        <button class="button green" onclick="updateRecordFromGui(${index})">save</button>
      </div>
  `);
}

function updateTime(){
  document.getElementById('current-time').innerHTML = dayjs().format('ddd MMMM D @ h:mm a')
}
