// js
let records = [];
const display_format = "h:mm a";
const icons = {
  'left': `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" />
</svg>`,
  'right': `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
</svg>`,
  'poop': '💩',
  'pee': `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" />
</svg>`,
};

load();
drawRecords();
updateTime();
setInterval(updateTime, 1000 * 5);


document.querySelectorAll('button').forEach(el=>el.addEventListener('click', record))

// store data locally: no data transmission
function record(el) {

  const type = el?.currentTarget?.dataset?.type;
  if (!type) {
    return;
  }

  records.unshift({id: uuid(), type, time: new Date().toISOString() });
  saveRecords();
  drawRecords();
}

function saveRecords(){
  records.sort((a,b) => a.time < b.time ? 1 : -1);
  localStorage.setItem('data', JSON.stringify(records));
}

// load data from local device, if any exists
function load() {
  if (localStorage.data) {
    records = JSON.parse(localStorage.data);
  }
}

function drawRecords() {
  const table = records?.length
    ? `
      ${records.map(drawRecord).join('')}
    </table>
  ` : '<div class="p-10">No Records</div>';

  document.getElementById('data-table').innerHTML = table;
  drawTimeSinceLastEvent();
}

function drawRecord(record, index) {
  if(!record?.type || !record?.time) return '';

  let separator = '';
  if (index === 0 || dayjs(records[index-1].time).format('YYYYMMDD') != dayjs(record.time).format('YYYYMMDD')) {
    separator = `</table><table class="striped w-full text-center"><tr><td colspan="2" class="bg-gray-700 pt-3 pb-1 text-sm text-gray-500">${dayjs(record.time).format('dddd MMMM D')}</td></tr>`
  }

  return `${separator}
  <tr data-id="${record.id}" class="selectable-row mb-2 text-lg" onclick="editModal(${index})">
    <td class="px-5">${icons[record.type]}</td>
    <td>${dayjs(record.time).format(display_format)}</td>
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
