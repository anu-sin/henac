import CACHE from './cache.js';

const APP = {
  itemList: [],
  activeLI: '',
  init() {
    //page loaded
    document.getElementById('itemForm').addEventListener('submit', APP.addItem);
    document.getElementById('btnItem').addEventListener('click', APP.addItem);
    document.getElementById('btnList').addEventListener('click', APP.saveList);
    //access the cache
    let cacheVersion = 1;
    let cacheName = `filecache-v${cacheVersion}`;
    CACHE.init(cacheName).then(() => {
      //now display files
      APP.getFiles();
    });
    //and then show all the current files
    document.getElementById('file_list').addEventListener('click', APP.displayFileContents);
    document.getElementById('file_list').addEventListener('click', APP.deleteFile);
  },
  addItem(ev) {
    //add an item to the list
    ev.preventDefault();
    let item = document.getElementById('gItem').value;
    item = item.trim();
    if (!item) return;
    APP.itemList.push(item);
    APP.displayList();
  },
  saveList(ev) {
    //turn the data from the list into the contents for a json file
    ev.preventDefault();
    let data = JSON.stringify(APP.itemList);
    APP.makeFile(data);
  },
  makeFile(data) {
    //create a file
    let filename = `itemlist-${Date.now()}.json`;
    let file = new File([data], filename, { type: 'application/json' });
    let response = new Response(file, {
      status: 200,
      statusText: 'OK',
    });
    APP.saveFile(filename, response);
  },
  saveFile(filename, response) {
    //save the file in the Cache
    let request = new Request(`./data/${filename}`);
    CACHE.saveFile(request, response)
      .then(() => {
        //file has been saved
        //clear the displayed list
        APP.itemList = [];
        APP.displayList();
        //update the list of files
        APP.getFiles();
      })
      .catch((err) => {
        console.warn(err.message);
      });
  },
  displayList() {
    //populate the list of items
    let list = document.getElementById('item_list');
    if (APP.itemList.length === 0) {
      list.innerHTML = 'No Items currently.';
    } else {
      list.innerHTML = APP.itemList
        .map((txt) => {
          return `<li>${txt}</li>`;
        })
        .join('');
    }
    document.getElementById('gItem').value = '';
  },
  getFiles() {
    //display all the files in the cache
    CACHE.getFiles()
      .then((matches) => {
        //loop through response matches and display the file names
        APP.displayFiles(matches);
      })
      .catch((err) => {
        console.warn(err.message);
      });
  },
  displayFiles(matches) {
    //show the file names
    let list = document.getElementById('file_list');
    if (matches.length === 0) {
      list.innerHTML = `<li>No Files Currently.</li>`;
    } else {
      list.innerHTML = matches
        .map((request) => {
          let url = new URL(request.url);
          let filename = url.pathname.replace('/data/', '');
          return `<li ${filename === APP.activeLI ? 'class="active"' : ''}><span>${filename}</span> <button class="btnDelete">DELETE</button></li>`;
        })
        .join('');
    }
  },
  displayFileContents(ev) {
    //get the list item and show its contents
    let span = ev.target.closest('span');
    if (!span) return;
    document.querySelector('li.active')?.classList.remove('active');
    let li = span.parentElement;
    li.classList.add('active');
    APP.activeLI = span.textContent;
    let filename = `/data/${span.textContent}`;
    CACHE.getResponse(filename)
      .then((response) => {
        if (!response.ok) throw new Error('Cached File Request Failed');
        return response.json();
      })
      .then((data) => {
        let code = document.querySelector('.data_display pre code');
        code.textContent = data;
        let name = filename.replace('/data/', '');
        document.querySelector('.data_display h2 span').textContent = name;
      })
      .catch((err) => {
        console.warn(err.message);
      });
  },
  deleteFile(ev) {
    ev.preventDefault();
    let btn = ev.target.closest('button.btnDelete');
    if (!btn) return;
    let span = btn.previousElementSibling;
    let li = btn.parentElement;
    let filename = `/data/${span.textContent}`;
    CACHE.removeFile(filename)
      .then((success) => {
        if (success) {
          li.remove();
          APP.activeLI = '';
          //clear the file name
          let span = document.querySelector('.data_display h2 span');
          span.textContent = '';

          //clear the code contents
          let code = document.querySelector('.data_display pre code');
          code.textContent = '';
        } else {
          console.log('failed to delete file from cache.');
        }
      })
      .catch((err) => {
        console.warn(err.message);
      });
  },
};

document.addEventListener('DOMContentLoaded', APP.init);
