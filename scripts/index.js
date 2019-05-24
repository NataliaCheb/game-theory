$(document).on('click', '.nav-item a', function (e) {
  e.preventDefault()
  $(this).tab('show')
});

function createTable(firstPlayerStrategies, secondPlayerStrategies) {
  mainTable.innerHTML = '';
  var thead = document.createElement('thead'),
    headTr = document.createElement('tr');
  var emptyCeil = document.createElement('th');
  thead.appendChild(emptyCeil);
  for (var i = 1; i <= secondPlayerStrategies; i++) {
    var th = document.createElement('th');
    th.dataset.cols = i;
    th.innerHTML = `B<sub>${i}</sub>`;
    th.setAttribute('onclick', 'javascript: void(0)');
    th.dataset.cd = '';
    thead.appendChild(th);
  }
  var tbody = document.createElement('tbody');
  for (var i = 1; i <= firstPlayerStrategies; i++) {
    var th = document.createElement('th'),
      tr = document.createElement('tr');
    th.dataset.rows = i;
    th.setAttribute('onclick', 'javascript: void(0)');
    th.innerHTML = `A<sub>${i}</sub>`;
    th.dataset.cl = '';
    tr.appendChild(th);
    for (var ceil = 1; ceil <= secondPlayerStrategies; ceil++) {
      var td = document.createElement('td'),
        input = document.createElement('input');
      input.type = 'text';
      input.classList.add('browser-default');
      td.setAttribute('onclick', 'javascript: void(0)');
      td.dataset.row = i;
      td.dataset.col = ceil;
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  mainTable.appendChild(thead);
  mainTable.appendChild(tbody);
}

function generateValue(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var simplifyBtn = document.querySelector('#simplifyGame'),
  simplifyField = document.querySelector('#simplified'),
  gameMatrixTab = document.querySelector('#gameMatrixTab'),
  generateBtn = document.querySelector('.btn-generate'),
  generationSection = document.querySelector('#generationSection');

var autoCropTable,
  autoCropIndex = 1,
  firstPlayerCropped = false,
  secondPlayerCropped = false,
  hachureFirstPlayer = 0,
  hachureSecondPlayer = 0;

simplifyBtn.addEventListener('click', autoSimplifyHandler);

function autoSimplifyHandler() {
  autoCropIndex = 1;
  simplifyField.innerHTML = '';
  autoCrop(mainTable);
  firstPlayerCropped = false;
  secondPlayerCropped = false;
}

function duplicateTable(table, place, obj, type, subText = '') {
  var tmp = table.cloneNode(table);
  highlightBestWorst(tmp, obj.best, obj.worst, type);
  createPlaceForNewTable(simplifyField, tmp, `Крок ${autoCropIndex}: ${subText}`);
  autoCropIndex++;
}

gameMatrixTab.addEventListener('click', function () {
  isFunctionReaction = false;
  isFrFinished = false;
  isCroppingYourself = false;
  firstPlayerTableFR.innerHTML = '';
  secondPlayerTableFR.innerHTML = '';
});

function highlightBestWorst(table, best, worst, type) {
  var headingNumGood,
    headingGood,
    headingNumBad,
    headingBad;
  switch (type) {
    case 'row':
      headingNumGood = best[0].parentElement.getAttribute(`data-row`);
      headingGood = table.querySelector('tbody')
        .querySelector(`th[data-rows="${headingNumGood}"]`);
      headingNumBad = worst[0].parentElement.getAttribute(`data-row`);
      headingBad = table.querySelector(`th[data-rows="${headingNumBad}"]`);
      break;
    case 'col':
      headingNumGood = best[0].parentElement.getAttribute(`data-col`);
      headingGood = table.querySelector('thead')
        .querySelector(`th[data-cols="${headingNumGood}"]`);
      headingNumBad = worst[0].parentElement.getAttribute(`data-col`);
      headingBad = table.querySelector(`th[data-cols="${headingNumBad}"]`);
      break;
  }
  headingGood.classList.add('good-strategy-header');
  headingBad.classList.add('bad-strategy-header');
}

function cropAuto(table, number, type) {
  var heading,
    rows;
  switch (type) {
    case 'col':
      heading = table.querySelector('thead')
        .querySelector(`th[data-cols="${number}"]`);
      rows = nodeListToArray(table.querySelectorAll(`td[data-col="${number}"]`));
      heading.parentElement.removeChild(heading);
      rows.forEach(element => {
        element.parentElement.removeChild(element);
      });
      break;
    case 'row':
      heading = table.querySelector('tbody')
        .querySelector(`th[data-rows="${number}"]`);
      rows = nodeListToArray(table.querySelectorAll(`td[data-row="${number}"]`));
      rows[0].parentElement.parentElement.removeChild(rows[0].parentElement);
      heading.parentElement.removeChild(heading);
      break;
  }
}

function cleanAutoCropTable(table) {
  var ths = nodeListToArray(table.querySelectorAll('th')),
    tds = nodeListToArray(table.querySelectorAll('td'));
  ths.forEach(element => {
    element.classList.remove('good-strategy-header');
    element.classList.remove('bad-strategy-header');
  });
  tds.forEach(element => {
    element.classList.remove('good-strategy-element');
    element.classList.remove('bad-strategy-element');
  });
}

function autoCrop(table, isFirst = true) {
  try {
    cleanAutoCropTable(table);
  } catch (e) {
    console.log(e);
    return;
  }
  if (table.hasAttribute('id')) table.removeAttribute('id');
  var tbl = document.createElement('table');
  tbl.innerHTML = table.innerHTML;
  fillTableFromMain(table, tbl);
  if (isFirst) {
    var tblHoriz = getInputsInTableArray(getTableInArray(tbl)),
      obj;
    for (var row = 0; row < tblHoriz.length; row++) {
      obj = compareRow(tblHoriz[row], tblHoriz);
      if (typeof obj === 'object') {
        var rowNum = +obj.worst[0].parentElement.getAttribute('data-row');
        var tmpTbl = document.createElement('table');
        tmpTbl.innerHTML = tbl.innerHTML;
        fillTableFromMain(tbl, tmpTbl);
        var hachersFirst = (function (amount) {
          var str = '';
          if (amount > 0) {
            for (var i = 0; i < amount; i++) {
              str += '\'';
            }
          }
          return str;
        })(hachureSecondPlayer);
        duplicateTable(tbl, simplifyField, obj, 'row', `u<sub>P<sub>1</sub></sub>(A<sub>${obj.best[0].parentElement.getAttribute('data-row')}</sub>; S<sub>P<sub>2</sub></sub>${hachersFirst}) > u<sub>P<sub>1</sub></sub>(A<sub>${obj.worst[0].parentElement.getAttribute('data-row')}</sub>; S<sub>P<sub>2</sub></sub>${hachersFirst})`);
        hachureFirstPlayer++;
        cropAuto(tbl, rowNum, 'row');
        autoCropTable = tbl.cloneNode(true);
        return autoCrop(autoCropTable, false);
      }
    }
    if (obj === false) {
      var tblVert = switchArrayHeading(tblHoriz),
        obj;
      for (var row = 0; row < tblVert.length; row++) {
        obj = compareRow(tblVert[row], tblVert, 'col');
        if (typeof obj === 'object') {
          var colNum = +obj.worst[0].parentElement.getAttribute('data-col');
          var tmpTbl = document.createElement('table');
          tmpTbl.innerHTML = tbl.innerHTML;
          fillTableFromMain(tbl, tmpTbl);
          var hachersSecond = (function (amount) {
            var str = '';
            if (amount > 0) {
              for (var i = 0; i < amount; i++) {
                str += '\'';
              }
            }
            return str;
          })(hachureFirstPlayer);
          duplicateTable(tbl, simplifyField, obj, 'col', `u<sub>P<sub>2</sub></sub>(B<sub>${obj.best[0].parentElement.getAttribute('data-col')}</sub>; S<sub>P<sub>1</sub></sub>${hachersSecond}) > u<sub>P<sub>2</sub></sub>(B<sub>${obj.worst[0].parentElement.getAttribute('data-col')}</sub>; S<sub>P<sub>1</sub></sub>${hachersSecond})`);
          hachureSecondPlayer++;
          cropAuto(tbl, colNum, 'col');
          autoCropTable = tbl.cloneNode(true);
          return autoCrop(autoCropTable);
        }

      }
      !obj && theEndOfAutoCrop(tbl);
    }
  } else {
    var tblVert = getInputsInTableArray(switchArrayHeading(getTableInArray(tbl))),
      obj;
    for (var row = 0; row < tblVert.length; row++) {
      obj = compareRow(tblVert[row], tblVert, 'col');
      if (typeof obj === 'object') {
        var colNum = +obj.worst[0].parentElement.getAttribute('data-col');
        var tmpTbl = document.createElement('table');
        tmpTbl.innerHTML = tbl.innerHTML;
        fillTableFromMain(tbl, tmpTbl);
        var hachersSecond = (function (amount) {
          var str = '';
          if (amount > 0) {
            for (var i = 0; i < amount; i++) {
              str += '\'';
            }
          }
          return str;
        })(hachureFirstPlayer);
        duplicateTable(tbl, simplifyField, obj, 'col', `u<sub>P<sub>2</sub></sub>(B<sub>${obj.best[0].parentElement.getAttribute('data-col')}</sub>; S<sub>P<sub>1</sub></sub>${hachersSecond}) > u<sub>P<sub>2</sub></sub>(B<sub>${obj.worst[0].parentElement.getAttribute('data-col')}</sub>; S<sub>P<sub>1</sub></sub>${hachersSecond})`);
        hachureSecondPlayer++;
        cropAuto(tbl, colNum, 'col');
        autoCropTable = tbl.cloneNode(true);
        return autoCrop(autoCropTable);
      }
    }
    if (obj === false) {
      var tblHoriz = switchArrayHeading(tblVert),
        obj;
      for (var row = 0; row < tblHoriz.length; row++) {
        obj = compareRow(tblHoriz[row], tblHoriz);
        if (typeof obj === 'object') {
          var rowNum = +obj.worst[0].parentElement.getAttribute('data-row');
          var tmpTbl = document.createElement('table');
          tmpTbl.innerHTML = tbl.innerHTML;
          fillTableFromMain(tbl, tmpTbl);
          var hachersFirst = (function (amount) {
            var str = '';
            if (amount > 0) {
              for (var i = 0; i < amount; i++) {
                str += '\'';
              }
            }
            return str;
          })(hachureSecondPlayer);
          duplicateTable(tbl, simplifyField, obj, 'row', `u<sub>P<sub>1</sub></sub>(A<sub>${obj.best[0].parentElement.getAttribute('data-row')}</sub>; S<sub>P<sub>2</sub></sub>${hachersFirst}) > u<sub>P<sub>1</sub></sub>(A<sub>${obj.worst[0].parentElement.getAttribute('data-row')}</sub>; S<sub>P<sub>2</sub></sub>${hachersFirst})`);
          hachureFirstPlayer++;
          cropAuto(tbl, rowNum, 'row');
          autoCropTable = tbl.cloneNode(true);
          return autoCrop(autoCropTable, false);
        }
      }
      !obj && theEndOfAutoCrop(tbl);
    }
  }
}

function theEndOfAutoCrop(table) {
  createPlaceForNewTable(simplifyField, table, 'Спрощена таблиця');
  hachureFirstPlayer = 0;
  hachureSecondPlayer = 0;
}

function compareRow(row, array, type = 'row') {
  for (var r = 0; r < array.length; r++) {
    var bigger = [];
    for (var c = 0; c < array[r].length; c++) {
      if (row.equals(array[r])) {
        break;
      } else {
        if (row[c] !== undefined) {
          if (+row[c].value > array[r][c].value) {
            bigger.push(true);
          } else {
            bigger.push(false);
          }
        }
      }
    }
    if (!bigger.includes(false) && bigger.length > 0) {
      if (type === 'row') {
        array[r].forEach(element => {
          element.parentElement.classList.add('bad-strategy-element');
        });
        row.forEach(element => {
          element.parentElement.classList.add('good-strategy-element');
        });
        return {
          best: row,
          worst: array[r]
        };
      } else {
        array[r].forEach(element => {
          element.parentElement.classList.add('good-strategy-element');
        });
        row.forEach(element => {
          element.parentElement.classList.add('bad-strategy-element');
        });
        return {
          best: array[r],
          worst: row
        };
      }
    }
  }
  return false;
}

function fillTableFromMain(mainTable, firstTable, secondTable) {
  if (secondTable === undefined) {
    var inputs = getInputsInTableArray(getTableInArray(mainTable)),
      table = getInputsInTableArray(getTableInArray(firstTable)),
      values = getValuesFromInputArray(inputs);
    for (var row = 0; row < values.length; row++) {
      for (var ceil = 0; ceil < values[row].length; ceil++) {
        fillCeil(table[row][ceil], values[row][ceil]);
      }
    }
  } else {
    var inputs = getInputsInTableArray(getTableInArray(mainTable)),
      t1i = getInputsInTableArray(getTableInArray(firstTable.children[0])),
      t2i = getInputsInTableArray(getTableInArray(secondTable.children[0])),
      values = getValuesFromInputArray(inputs);
    for (var row = 0; row < values.length; row++) {
      for (var ceil = 0; ceil < values[row].length; ceil++) {
        fillCeil(t1i[row][ceil], values[row][ceil]);
        fillCeil(t2i[row][ceil], values[row][ceil] * -1);
        t1i[row][ceil].dataset.isFr = '';
        t2i[row][ceil].dataset.isFr = '';
      }
    }
  }

  function fillCeil(element, value) {
    element.disabled = true;
    element.value = value;
  }
}

function switchArrayHeading(array) {
  var tmp = [];
  for (var row = 0; row < array[0].length; row++) {
    var tmpArr = [];
    for (var ceil = 0; ceil < array.length; ceil++) {
      tmpArr.push(array[ceil][row]);
    }
    tmp.push(tmpArr);
  }
  return tmp;
}

function getTableInArray(table) {
  var arrayOfTD = [],
    tableRows = nodeListToArray($(table).find('tbody tr'));
  tableRows.forEach(element => {
    var tr = [];
    for (var i = 0; i < element.children.length; i++) {
      if (element.children[i].nodeName === 'TD') {
        tr.push(element.children[i]);
      }
    }
    arrayOfTD.push(tr);
  });
  return arrayOfTD;
}

function getInputsInTableArray(table) {
  var arrayOfInputs = [];
  table.forEach(element => {
    var inputRow = [];
    element.forEach(td => {
      inputRow.push(td.children[0]);
    });
    arrayOfInputs.push(inputRow);
  });
  return arrayOfInputs;
}

function getValuesFromInputArray(inputArray) {
  var valuesArray = [];
  inputArray.forEach(row => {
    var tmpArr = [];
    row.forEach(ceil => {
      tmpArr.push(ceil.value);
    });
    valuesArray.push(tmpArr);
  });
  return valuesArray;
}

function createAliasTable(mainTable, place) {
  var table = document.createElement('table');
  table.innerHTML = mainTable.innerHTML;
  place.appendChild(table);
  return table;
}

function nodeListToArray(nodeList) {
  return Array.prototype.slice.call(nodeList);
}

function createPlaceForNewTable(place, table, text) {
  var row = document.createElement('div');
  row.classList.add('row');
  row.classList.add('center-align');
  var col = document.createElement('div'),
    colText = document.createElement('div');
  col.classList.add('col');
  col.classList.add('s12');
  colText.classList.add('col');
  colText.classList.add('s12');
  colText.classList.add('flow-text');
  colText.classList.add('card-panel');
  colText.classList.add('light-blue');
  colText.classList.add('lighten-1');
  colText.innerHTML = text;
  col.appendChild(table);
  row.appendChild(colText);
  row.appendChild(col);
  place.appendChild(row);
  return row;
}

Array.prototype.equals = function (array) {
  if (!array) {
    return false;
  }
  if (this.length !== array.length) {
    return false;
  }
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i])) {
        return false;
      }
    } else if (this[i] !== array[i]) {
      return false;
    }
  }
  return true;
};
Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

var
  cropTable = document.querySelector('#cropTable'),
  restOfCrops = document.querySelector('#restOfCrops'),
  cropBtn = document.querySelector('.btn-crop'),
  simplifyTab = document.querySelector('#simplifyYourselfTab'),
  cleanYourselfBtn = document.querySelector('.btn-clean');

var placeCropTable,
  isCroppingYourself = false,
  cropArray = [],
  cropTarget,
  cropSelectedArray = [],
  cropSelectedTarget,
  croppableTable = cropTable,
  simpifingYourselfIndex = 1,
  croppingArrayYS = [],
  croppingElementYS;

function crop(table, number, type) {
  var newTable = document.createElement('table'),
    poppingArray,
    headingToRemove,
    row,
    text = `Крок ${simpifingYourselfIndex}: `;
  simpifingYourselfIndex++;
  newTable.innerHTML = table.innerHTML;
  fillTableFromMain(table, newTable);
  cleanTable(table);
  croppableTable = newTable;
  switch (type) {
    case 'row':
      headingToRemove = newTable.querySelector(`th[data-rows="${number}"]`);
      poppingArray = nodeListToArray(newTable.querySelectorAll(`td[data-row="${number}"]`));
      text += `Û<sub>P<sub>1</sub></sub>(A<sub>${headingToRemove.getAttribute('data-rows')}</sub>; S<sub>P<sub>2</sub></sub>)`;
      row = poppingArray[0].parentElement;
      row.parentElement.removeChild(row);
      break;
    case 'col':
      headingToRemove = newTable.querySelector(`th[data-cols="${number}"]`);
      text += `Û<sub>P<sub>2</sub></sub>(B<sub>${headingToRemove.getAttribute('data-cols')}</sub>; S<sub>P<sub>1</sub></sub>)`;
      poppingArray = nodeListToArray(newTable.querySelectorAll(`td[data-col="${number}"]`));
      break;
  }
  headingToRemove.parentElement.removeChild(headingToRemove);
  poppingArray.forEach(element => {
    element.parentElement.removeChild(element);
  });
  if (nodeListToArray(newTable.querySelector('thead')
    .querySelectorAll('th')).length === 2) {
    nodeListToArray(newTable.querySelector('thead')
      .querySelectorAll('th')).forEach(element => {
        element.removeAttribute('data-cd');
      });
  }
  if (nodeListToArray(newTable.querySelector('tbody')
    .querySelectorAll('tr')).length === 1) {
    nodeListToArray(newTable.querySelector('tbody')
      .querySelectorAll('th')).forEach(element => {
        element.removeAttribute('data-cl');
      });
  }
  if (nodeListToArray(newTable.querySelectorAll('td')).length === 1) {
    newTable.dataset.ended = '';
  }
  createPlaceForNewTable(restOfCrops, newTable, text);
  croppingElementYS.classList.add('cropped-header');
  croppingArrayYS.forEach(element => {
    element.classList.add('cropped-element');
  });
}

function cleanSimplifingYourself(table, mainTable, place, restPlace) {
  place.innerHTML = '';
  restPlace.innerHTML = '';
  var tmpTable = createAliasTable(mainTable, place);
  fillTableFromMain(mainTable, tmpTable);
  table.removeAttribute('data-ended');
  unselectCropArea();
  croppableTable = tmpTable;
}

function cleanTable(table) {
  var thead = nodeListToArray(table.querySelector('thead').children[0].querySelectorAll('th')),
    tbody = table.querySelector('tbody');
  thead.forEach(element => {
    element.removeAttribute('class');
    element.removeAttribute('data-cols');
    element.removeAttribute('data-cd');
  });
  nodeListToArray(tbody.querySelectorAll('th')).forEach(element => {
    element.removeAttribute('class');
    element.removeAttribute('data-rows');
    element.removeAttribute('data-cl');
  });
  nodeListToArray(tbody.querySelectorAll('td')).forEach(element => {
    element.removeAttribute('class');
    element.removeAttribute('data-row');
    element.removeAttribute('data-col');
  });
}

cropBtn.addEventListener('click', cropHandler);

cleanYourselfBtn.addEventListener('click', cleanSmpAreaHandler);

function cleanSmpAreaHandler() {
  if (isCroppingYourself) {
    simpifingYourselfIndex = 1;
    cleanSimplifingYourself(croppableTable, mainTable, cropTable, restOfCrops);
  }
}

function cropHandler() {
  if (isCroppingYourself) {
    if (cropSelectedArray.length === 0) return;
    var element = cropSelectedTarget;
    unselectCropArea();
    var table = croppableTable;
    if (nodeListToArray(croppableTable.querySelectorAll('td')).length > 0) {
      table.dataset.ended = '';
      var th = nodeListToArray(table.querySelectorAll('.cursor-crop-down, .cursor-crop-left')),
        tmp = table,
        number,
        type;
      th.forEach(element => {
        element.classList.remove('cursor-crop-down');
        element.classList.remove('cursor-crop-left');
      });
      if (element.hasAttribute('data-cols')) {
        number = +element.getAttribute('data-cols');
        type = 'col';
      } else if (element.hasAttribute('data-rows')) {
        number = +element.getAttribute('data-rows');
        type = 'row';
      }
      crop(tmp, number, type, true);
    }
  }
}

document.addEventListener('click', function (e) {
  if (isCroppingYourself) {
    try {
      if (!e.target.parentNode.parentNode.parentNode.hasAttribute('data-ended')) {
        if (e.target.classList.contains('crop-target-selected')) {
          cropSelectedTarget.classList.remove('crop-target-selected');
          cropSelectedTarget = undefined;
          cropSelectedArray.forEach(element => {
            element.classList.remove('crop-line-selected');
          });
          croppingElementYS = undefined;
          croppingArrayYS = [];
          cropSelectedArray = [];
        } else if (e.target.hasAttribute('data-cl')) {
          unselectCropArea();
          cropSelectedTarget = e.target;
          croppingElementYS = cropSelectedTarget;
          cropSelectedTarget.classList.add('crop-target-selected');
          var rowId = e.target.getAttribute('data-rows');
          var rows = croppableTable.querySelectorAll(`td[data-row="${rowId}"]`);
          rows = nodeListToArray(rows);
          croppingArrayYS = [];
          rows.forEach(element => {
            element.classList.add('crop-line-selected');
            croppingArrayYS.push(element);
          });
          cropSelectedArray = rows;
        } else if (e.target.hasAttribute('data-cd')) {
          unselectCropArea();
          cropSelectedTarget = e.target;
          croppingElementYS = cropSelectedTarget;
          cropSelectedTarget.classList.add('crop-target-selected');
          var colId = e.target.getAttribute('data-cols');
          var cols = croppableTable.querySelectorAll(`td[data-col="${colId}"]`);
          cols = nodeListToArray(cols);
          croppingArrayYS = [];
          cols.forEach(element => {
            element.classList.add('crop-line-selected');
            croppingArrayYS.push(element);
          });
          cropSelectedArray = cols;
        }
      }
    } catch (e) { }
  }
});

document.body.addEventListener('mouseover', function (e) {
  if (isCroppingYourself) {
    try {
      if (e.target.parentNode.parentNode.parentNode.tagName === 'TABLE') {
        if (!e.target.parentNode.parentNode.parentNode.hasAttribute('data-ended')) {
          if (e.target.hasAttribute('data-cl')) {
            if (cropTarget !== undefined) {
              cropTarget.classList.remove('target');
            }
            cropArray.forEach(element => {
              element.classList.remove('selected');
            });
            cropArray = [];
            cropTarget = e.target;
            cropTarget.classList.add('target');
            var rowId = e.target.getAttribute('data-rows');
            e.target.classList.add('cursor-crop-left');
            var rows = croppableTable.querySelectorAll(`td[data-row="${rowId}"]`);
            rows = nodeListToArray(rows);
            rows.forEach(element => {
              element.classList.add('selected');
            });
            cropArray = rows;
          } else if (e.target.hasAttribute('data-cd')) {
            if (cropTarget !== undefined) {
              cropTarget.classList.remove('target');
            }
            cropArray.forEach(element => {
              element.classList.remove('selected');
            });
            cropTarget = e.target;
            cropArray = [];
            cropTarget.classList.add('target');
            var colId = e.target.getAttribute('data-cols');
            e.target.classList.add('cursor-crop-down');
            var cols = croppableTable.querySelectorAll(`td[data-col="${colId}"]`);
            cols = nodeListToArray(cols);
            cols.forEach(element => {
              element.classList.add('selected');
            });
            cropArray = cols;
          }
        }
      }
    } catch (e) { }
  }
});

document.addEventListener('mouseout', function (e) {
  if (isCroppingYourself) {
    if (cropTarget !== undefined) {
      cropTarget.classList.remove('target');
      cropTarget = undefined;
    }
    cropArray.forEach(element => {
      element.classList.remove('selected');
    });
    cropArray = [];
  }
});

function unselectCropArea() {
  if (isCroppingYourself) {
    if (cropSelectedTarget !== undefined) {
      cropSelectedTarget.classList.remove('crop-target-selected');
      cropSelectedTarget = undefined;
    }
    cropSelectedArray.forEach(element => {
      element.classList.remove('crop-line-selected');
    });
    cropSelectedArray = [];
  }
}

simplifyTab.addEventListener('click', function () {
  isFunctionReaction = false;
  isFrFinished = false;
  isCroppingYourself = true;
  cropTable.innerHTML = '';
  var table = createAliasTable(mainTable, cropTable);
  fillTableFromMain(mainTable, table);
  placeCropTable = table;
});

var
  functionReactionTab = document.querySelector('#reactionFunctionTab'),
  showSecondPlayer = document.querySelector('#showSecondPlayer'),
  secondPlayerField = document.querySelector('#playerTwoField'),
  findFunctionReactionBtn = document.querySelector('.btn-react-findPrice'),
  firstPlayerMaxes = document.querySelector('#firstPlayerMaxes'),
  secondPlayerMaxes = document.querySelector('#secondPlayerMaxes');

var isFunctionReaction = false,
  isFrFinished = false,
  secondPlayerTableFR = document.querySelector('#tableSecondPlayer'),
  firstPlayerTableFR = document.querySelector('#tableFirstPlayer');

function generateFunctionReactionTables() {
  var firstPlayerInner,
    secondPlayerInner;
  firstPlayerInner = secondPlayerInner = mainTable.innerHTML;
  var table1 = document.createElement('table'),
    table2 = document.createElement('table');
  table1.innerHTML = firstPlayerInner;
  table2.innerHTML = secondPlayerInner;
  firstPlayerTableFR.appendChild(table1);
  secondPlayerTableFR.appendChild(table2);
}

function findColMax(row, index) {
  findMaxes(row, index, firstPlayerMaxes.children[1], 'B', 'A');
}

function findRowMax(row, index) {
  findMaxes(row, index, secondPlayerMaxes.children[1], 'A', 'B');
}

function findMaxes(row, index, placeForStrategies, rowLetter, colLetter) {
  var maxCeils = [],
    maxIndexes = [],
    max = -1000;
  for (var ceil = 0; ceil < row.length; ceil++) {
    if (+row[ceil].value === max) {
      maxIndexes.push(ceil);
      maxCeils.push(row[ceil]);
    } else if (+row[ceil].value > max) {
      max = +row[ceil].value;
      maxCeils = [];
      maxIndexes = [];
      maxIndexes.push(ceil);
      maxCeils.push(row[ceil]);
    }
  }
  var str = '';
  maxIndexes.forEach((element, index) => {
    str += `${colLetter}<sub>${element + 1}</sub>${index !== maxIndexes.length - 1 ? ', ' : ''}`;
  });
  placeForStrategies.innerHTML += `<p>${index + 1}. š<sub>${colLetter}</sub>(${rowLetter}<sub>${index + 1}</sub>) = ${maxIndexes.length > 1 ? `{ ${str} }` : str}; Û<sub>${rowLetter}</sub>(${colLetter}<sub>${index + 1}</sub>) = ${maxCeils[0].value}</p>`;
  maxCeils.forEach(element => {
    element.parentNode.classList.add('checked');
  });
}

function findRowPrice(row) {
  var min = 1000;
  for (var ceil = 0; ceil < row.length; ceil++) {
    if (+row[ceil].children[0].value < min) {
      min = +row[ceil].children[0].value;
    }
  }
  return min;
}

function findColPrice(col) {
  var max = -1000;
  for (var ceil = 0; ceil < col.length; ceil++) {
    if (+col[ceil].children[0].value > max) {
      max = +col[ceil].children[0].value;
    }
  }
  return max;
}

functionReactionTab.addEventListener('click', function () {
  if (!functionReactionTab.classList.contains('active')) {
    firstPlayerTableFR.innerHTML = '';
    secondPlayerTableFR.innerHTML = '';
    isFunctionReaction = true;
    secondPlayerShown = false;
    showSecondPlayer.checked = false;
    secondPlayerField.style.display = 'none';
    secondPlayerMaxes.style.display = 'none';
    firstPlayerMaxes.children[1].innerHTML = '';
    secondPlayerMaxes.children[1].innerHTML = '';
    generateFunctionReactionTables();
    fillTableFromMain(mainTable, firstPlayerTableFR, secondPlayerTableFR);
    isCroppingYourself = false;
  }
});

document.addEventListener('click', function (e) {
  if (isFunctionReaction) {
    if (e.target.hasAttribute('data-is-fr')) {
      if (!isFrFinished) {
        e.target.parentNode.classList.toggle('guessed');
      }
    }
  }
});

findFunctionReactionBtn.addEventListener('click', function () {
  var playerOneTable = getInputsInTableArray(getTableInArray(firstPlayerTableFR.children[0])),
    playerTwoTable = getInputsInTableArray(getTableInArray(secondPlayerTableFR.children[0]));
  isFrFinished = true;
  firstPlayerMaxes.children[1].innerHTML = '';
  secondPlayerMaxes.children[1].innerHTML = '';
  playerOneTable = switchArrayHeading(playerOneTable);
  for (var row = 0; row < playerOneTable.length; row++) {
    findColMax(playerOneTable[row], row);
  }

  for (var row = 0; row < playerTwoTable.length; row++) {
    findRowMax(playerTwoTable[row], row);
  }
  playerOneTable.forEach(row => {
    row.forEach(ceil => {
      if (ceil.parentNode.classList.contains('guessed')) {
        if (ceil.parentNode.classList.contains('checked')) {
          ceil.parentNode.classList.remove('checked');
          ceil.parentNode.classList.remove('guessed');
          ceil.parentNode.classList.add('correct');
        } else {
          ceil.parentNode.classList.remove('checked');
          ceil.parentNode.classList.remove('guessed');
          ceil.parentNode.classList.add('wrong');
        }
      }
    });
  });
  playerTwoTable.forEach(row => {
    row.forEach(ceil => {
      if (ceil.parentNode.classList.contains('guessed')) {
        if (ceil.parentNode.classList.contains('checked')) {
          ceil.parentNode.classList.remove('checked');
          ceil.parentNode.classList.remove('guessed');
          ceil.parentNode.classList.add('correct');
        } else {
          ceil.parentNode.classList.remove('checked');
          ceil.parentNode.classList.remove('guessed');
          ceil.parentNode.classList.add('wrong');
        }
      }
    });
  });
});

showSecondPlayer.addEventListener('click', function () {
  if (!secondPlayerShown) {
    secondPlayerShown = !secondPlayerShown;
    secondPlayerField.style.display = 'block';
    secondPlayerMaxes.style.display = 'block';
  } else {
    secondPlayerShown = !secondPlayerShown;
    secondPlayerField.style.display = 'none';
    secondPlayerMaxes.style.display = 'none';
  }
});

var
  gamePricePlace = document.querySelector('#gamePricePlace'),
  findPrice = document.querySelector('.btn-find-extremums'),
  gamePriceTab = document.querySelector('#gamePriceTab');
var priceTable;

function appendAlphaBeta(table) {
  var theadTr = table.querySelector('thead').querySelector('tr');
  var alpha = document.createElement('th');
  alpha.innerText = 'α';
  alpha.style.color = '#ED4C67';
  theadTr.appendChild(alpha);
  var tbody = table.querySelector('tbody').querySelectorAll('tr');
  tbody = nodeListToArray(tbody);
  tbody.forEach((element, index) => {
    var th = document.createElement('th'),
      input = document.createElement('input');
    input.dataset.minRow = index + 1;
    input.type = 'text';
    input.classList.add('browser-default');
    input.disabled = true;
    th.appendChild(input);
    element.appendChild(th);
  });
  var betaRow = document.createElement('tr'),
    beta = document.createElement('th');
  beta.style.color = '#1289A7';
  beta.innerText = 'β';
  var tfoot = document.createElement('tfoot');
  betaRow.appendChild(beta);
  var rowLength = tbody[0].querySelectorAll('td').length;
  for (var i = 0; i < rowLength; i++) {
    var td = document.createElement('td'),
      input = document.createElement('input');
    input.classList.add('browser-default');
    input.type = 'text';
    input.dataset.maxCol = i + 1;
    input.disabled = true;
    td.appendChild(input);
    betaRow.appendChild(td);
  }
  var empty = document.createElement('td');
  betaRow.appendChild(empty);
  tfoot.appendChild(betaRow);
  table.appendChild(tfoot);
}

findPrice.addEventListener('click', function () {
  var table = getTableInArray(priceTable);
  table.forEach((element, index) => {
    var minRowField = document.querySelector(`input[data-min-row="${index + 1}"]`);
    minRowField.value = findRowPrice(element);
  });
  table = switchArrayHeading(table);
  table.forEach((element, index) => {
    var maxColField = document.querySelector(`input[data-max-col="${index + 1}"]`);
    maxColField.value = findColPrice(element);
  });
  var rowMax = nodeListToArray(document.querySelectorAll('input[data-min-row]')),
    maxRow = rowMax[0],
    maxRowArray = [rowMax[0]];
  rowMax.forEach(element => {
    if (+element.value === +maxRow.value) {
      maxRowArray.push(element);
    } else if (+element.value > +maxRow.value) {
      maxRow = element;
      maxRowArray = [];
      maxRowArray.push(element);
    }
  });
  var colMin = nodeListToArray(document.querySelectorAll('input[data-max-col]')),
    minCol = colMin[0],
    minColsArray = [colMin[0]];
  colMin.forEach(element => {
    if (+element.value === +minCol.value) {
      minColsArray.push(element);
    } else if (+element.value < +minCol.value) {
      minCol = element;
      minColsArray = [];
      minColsArray.push(element);
    }
  });
  minColsArray.forEach(element => {
    element.parentNode.classList.add('guessed');
  });
  maxRowArray.forEach(element => {
    element.parentNode.classList.add('checked');
  });
  var saddlePointSet = false;
  for (var i = 0; i < maxRowArray.length; i++) {
    for (var j = 0; j < minColsArray.length; j++) {
      if (!saddlePointSet) {
        if (+maxRowArray[i].value === +minColsArray[j].value) {
          var saddlePoint = priceTable.querySelector(`td[data-col="${minColsArray[j].getAttribute('data-max-col')}"][data-row="${maxRowArray[i].getAttribute('data-min-row')}"]`);
          saddlePoint.classList.add('correct');
          saddlePointSet = true;
        }
      }
    }
  }
});

gamePriceTab.addEventListener('click', function () {
  isFunctionReaction = false;
  isFrFinished = false;
  isCroppingYourself = false;
  firstPlayerTableFR.innerHTML = '';
  secondPlayerTableFR.innerHTML = '';
  gamePricePlace.innerHTML = '';
  var table = createAliasTable(mainTable, gamePricePlace);
  fillTableFromMain(mainTable, table);
  appendAlphaBeta(table);
  priceTable = table;
});

var
  firstPlayerStrategies = document.querySelector('#firstPlayerStrategies'),
  secondPlayerStrategies = document.querySelector('#secondPlayerStrategies'),
  fillBtn = document.querySelector('.btn-fill'),
  functions = document.querySelector('#functions'),
  minGenValue = document.querySelector('#minValue'),
  maxGenValue = document.querySelector('#maxValue');

var
  mainTable = document.querySelector('#startTable'),
  secondPlayerShown = false,
  firstPlayerLength,
  secondPlayerLength;

generateBtn.addEventListener('click', generateHandler);

function generateHandler() {
  generationSection.style.display = 'block';
  secondPlayerTableFR.innerHTML = firstPlayerTableFR.innerHTML = '';
  functions.style.display = 'block';
  firstPlayerLength = +firstPlayerStrategies.value;
  secondPlayerLength = +secondPlayerStrategies.value;
  createTable(firstPlayerLength, secondPlayerLength);
  firstPlayerTableFR.innerHTML = '';
  secondPlayerTableFR.innerHTML = '';
  gamePricePlace.innerHTML = '';
  cropTable.innerHTML = '';
  restOfCrops.innerHTML = '';
  toMatrix();
  showSecondPlayer.checked = false;
  secondPlayerShown = false;
  secondPlayerField.style.display = 'none';
  firstPlayerMaxes.children[1].innerHTML = '';
  secondPlayerMaxes.children[1].innerHTML = '';
}

fillBtn.addEventListener('click', fillHandler);

function fillHandler() {
  var table = getTableInArray(mainTable),
    inputs = getInputsInTableArray(table),
    min = +minGenValue.value,
    max = +maxGenValue.value;
  inputs.forEach(row => {
    row.forEach(ceil => {
      ceil.value = generateValue(min, max);
    });
  });
  if (!!croppableTable.innerHTML) {
    croppableTable.innerHTML = '';
    var table = createAliasTable(mainTable, croppableTable);
    fillTableFromMain(mainTable, table);
    placeCropTable = table;
  }
  if (!!gamePricePlace.innerHTML) {
    gamePricePlace.innerHTML = '';
    var table = createAliasTable(mainTable, gamePricePlace);
    fillTableFromMain(mainTable, table);
    appendAlphaBeta(table);
    priceTable = table;
  }
  if (firstPlayerTableFR.children[0] !== undefined && secondPlayerTableFR.children[0] !== undefined) {
    fillTableFromMain(mainTable, firstPlayerTableFR, secondPlayerTableFR);
    getTableInArray(firstPlayerTableFR).forEach(row => {
      row.forEach(ceil => {
        ceil.classList.remove('checked');
        ceil.classList.remove('correct');
        ceil.classList.remove('wrong');
        ceil.classList.remove('guessed');
      });
    });
    getTableInArray(secondPlayerTableFR).forEach(row => {
      row.forEach(ceil => {
        ceil.classList.remove('checked');
        ceil.classList.remove('correct');
        ceil.classList.remove('wrong');
        ceil.classList.remove('guessed');
      });
    });
  }
  firstPlayerMaxes.children[1].innerHTML = '';
  secondPlayerMaxes.children[1].innerHTML = '';
  isFrFinished = false;
  firstPlayerCropped = false;
  secondPlayerCropped = false;
}

function toMatrix() {
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  gameMatrixTab.dispatchEvent(evt);
}
function toSimplifing() {
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  simplifyTab.dispatchEvent(evt);
}

function toFunctionReaction() {
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  functionReactionTab.dispatchEvent(evt);
}

function toGamePrice() {
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  gamePriceTab.dispatchEvent(evt);
}

document.addEventListener('keyup', function (e) {
  if (e.code === 'Backspace') {
    if (isCroppingYourself) {
      cropHandler();
    }
  } else if (e.code === 'KeyG') {
    generateHandler();
  } else if (e.code === 'KeyR') {
    fillHandler();
  } else if (e.code === 'KeyS') {
    autoSimplifyHandler();
  }
});

function KeyPress(e) {
  var evtobj = window.event
    ? event
    : e;
  if (evtobj.keyCode === 8 && evtobj.ctrlKey) {
    e.preventDefault();
    cleanSmpAreaHandler();
  } else if (evtobj.ctrlKey && evtobj.keyCode === 49) {
    e.preventDefault();
    toMatrix();
  } else if (evtobj.ctrlKey && evtobj.keyCode === 50) {
    e.preventDefault();
    toSimplifing();
  } else if (evtobj.ctrlKey && evtobj.keyCode === 51) {
    e.preventDefault();
    toFunctionReaction();
  } else if (evtobj.ctrlKey && evtobj.keyCode === 52) {
    e.preventDefault();
    toGamePrice();
  } else if (evtobj.ctrlKey && evtobj.keyCode === 53) {
    e.preventDefault();
    toGraphic();
  }
}

document.addEventListener('keydown', KeyPress);

(function () {
  var elem = document.querySelector('.cumf_bt_form_wrapper'),
    cblink = document.querySelector('.cbalink'),
    script = document.body.querySelector('script');
  try {
    elem.parentNode.removeChild(elem);
    cblink.parentNode.removeChild(cblink);
    script.parentNode.removeChild(script);
  } catch (e) { }
})();