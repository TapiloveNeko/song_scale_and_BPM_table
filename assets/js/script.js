let musicData = [];

const baseScales = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const scaleOrder = {};

// メジャースケール（0-11）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}メジャー`] = index;
});

// マイナースケール（12-23）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}マイナー`] = index + 12;
});

// ドリアンスケール（24-35）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}ドリアン`] = index + 24;
});

// フリジアンスケール（36-47）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}フリジアン`] = index + 36;
});

// リディアンスケール（48-59）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}リディアン`] = index + 48;
});

// ミクソリディアンスケール（60-71）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}ミクソリディアン`] = index + 60;
});

// ロクリアンスケール（72-83）
baseScales.forEach((scale, index) => {
  scaleOrder[`${scale}ロクリアン`] = index + 72;
});

const initializeTheme = () => {
  const savedTheme = 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeIcon').textContent = '🌞';
  } else {
    document.body.classList.add('dark-mode');
    document.getElementById('themeIcon').textContent = '🌙';
  }
};

const toggleTheme = () => {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeIcon').textContent = '🌞';
  } else {
    document.body.classList.add('dark-mode');
    document.getElementById('themeIcon').textContent = '🌙';
  }
};

const toggleSortMenu = () => {
  const sortMenu = document.getElementById('sortMenu');
  sortMenu.classList.toggle('show');
};

const closeSortMenu = () => {
  const sortMenu = document.getElementById('sortMenu');
  sortMenu.classList.remove('show');
};

const handleMobileMenuClick = (event) => {
  if (window.innerWidth <= 767) {
    event.stopPropagation();
    toggleSortMenu();
  }
};

const handleDocumentClick = (event) => {
  if (window.innerWidth <= 767) {
    const sortMenu = document.getElementById('sortMenu');
    
    if (!sortMenu.contains(event.target) && !event.target.closest('#sortButton')) {
      closeSortMenu();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  
  document.getElementById('themeToggle').addEventListener('click', () => {
    toggleTheme();
  });
  document.getElementById('sortButton').addEventListener('click', handleMobileMenuClick);
  document.addEventListener('click', handleDocumentClick);
});

fetch('assets/json/data.json')
  .then(response => response.json())
  .then(data => {
    musicData = data;
    renderTable();
    sortByScale();
  })
  .catch(error => console.error('データ読み込みエラー:', error));

const renderTable = () => {
  const tableBody = document.getElementById('musicTableBody');
  tableBody.innerHTML = '';
  
  musicData.map(song => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.textContent = song.name;
      row.appendChild(nameCell);
      
      const scaleCell = document.createElement('td');
      const formattedScale = song.scale.replace(/\|/g, '<br>');
      scaleCell.innerHTML = formattedScale;
      row.appendChild(scaleCell);
      
      const bpmCell = document.createElement('td');
      bpmCell.textContent = song.bpm;
      row.appendChild(bpmCell);
      
      tableBody.appendChild(row);
  });
};

const getCharType = (char) => {
  const code = char.charCodeAt(0);
  
  if (code >= 0x3040 && code <= 0x309F) return 1; // ひらがな
  if (code >= 0x30A0 && code <= 0x30FF) return 2; // カタカナ
  if ((code >= 0x4E00 && code <= 0x9FFF) || 
      (code >= 0x3400 && code <= 0x4DBF)) return 3; // 漢字
  if ((code >= 0x0041 && code <= 0x005A) || 
      (code >= 0x0061 && code <= 0x007A)) return 4; // アルファベット
  return 5; // その他
};

const sortTable = (columnIndex, isNumeric = false) => {
  const headers = document.querySelectorAll("#musicTable th");
  
  headers.forEach(header => {
      header.classList.remove('sort-asc');
  });
  
  headers[columnIndex].classList.add('sort-asc');
  
  musicData.sort((a, b) => {
      let aValue, bValue;
      
      if (columnIndex === 0) {
          aValue = a.name;
          bValue = b.name;
          
          const aType = getCharType(aValue.charAt(0));
          const bType = getCharType(bValue.charAt(0));
          
          if (aType !== bType) {
              return aType - bType;
          }
          
          return aValue.localeCompare(bValue, 'ja-JP');
      } else if (columnIndex === 1) {
          return sortByScale();
      } else if (columnIndex === 2) {
          aValue = a.bpm;
          bValue = b.bpm;
          return isNumeric ? aValue - bValue : aValue.localeCompare(bValue);
      }
  });
  
  renderTable();
};

const getMainScale = (scaleString) => {
  const parts = scaleString.split('|');
  
  let choruses = parts.filter(part => part.includes('サビ'));
  
  if (choruses.length > 0) {
      return getScaleFromPart(choruses[0]);
  } else {
      return getScaleFromPart(parts[0]);
  }
};

const getScaleFromPart = (part) => {
  if (part.includes('：')) {
    const parts = part.split('：');
    if (parts[0].includes('メジャー') || parts[0].includes('マイナー') || 
        parts[0].includes('ドリアン') || parts[0].includes('フリジアン') || 
        parts[0].includes('リディアン') || parts[0].includes('ミクソリディアン') || 
        parts[0].includes('ロクリアン') || parts[0].includes('♭') || parts[0].includes('♯')) {
      return parts[0].trim();
    } else {
      return parts[1].trim();
    }
  } else {
      return part.trim();
  }
};

const sortByScale = () => {
  const headers = document.querySelectorAll("#musicTable th");
  const scaleColumnIndex = 1;
  
  headers.forEach(header => {
    header.classList.remove('sort-asc');
  });
  
  headers[scaleColumnIndex].classList.add('sort-asc');
  
  if (!musicData[0] || !musicData[0].hasOwnProperty('originalIndex')) {
    musicData.forEach((item, index) => {
      item.originalIndex = index;
    });
  }
  
  musicData.sort((a, b) => {
    let aScale = getMainScale(a.scale);
    let bScale = getMainScale(b.scale);
    
    let aOrder = 999;
    let bOrder = 999;
    
    for (const scale in scaleOrder) {
      if (aScale.includes(scale)) {
        aOrder = scaleOrder[scale];
        break;
      }
    }
    
    for (const scale in scaleOrder) {
      if (bScale.includes(scale)) {
        bOrder = scaleOrder[scale];
        break;
      }
    }
    
    if (aOrder === bOrder) {
      return a.originalIndex - b.originalIndex;
    }
    return aOrder - bOrder;
  });
  
  renderTable();
  return 0;
};