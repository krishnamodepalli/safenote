const notes = document.getElementById('notes');
const path = window.location.pathname;

function resizeTextarea() {
  const textarea = document.getElementById('notes');
  textarea.style.height = 'auto'; // Reset height to auto
  textarea.style.height = textarea.scrollHeight + 'px'; // Set height to scrollHeight
}

async function save_note() {
  // create the loading overlay
  let container = document.createElement("div");
  container.classList.add('container');
  container.classList.add('overlay');
  let spinner = document.createElement("i");
  spinner.classList.add('fa-solid');
  spinner.classList.add('fa-circle-notch');
  spinner.id = "spinner";
  spinner.style.margin = "auto";
  spinner.style.color = "#fff";
  spinner.style.fontSize = "1.5rem";
  container.appendChild(spinner);

  // adding the element to the DOM
  document.body.appendChild(container);
  container.appendChild(spinner);
  const response = await fetch(path + '/save-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: notes.value
  });
  while (!response) {
    continue
  }
  const cont = document.getElementsByClassName('overlay').item(0);
  cont.parentNode.removeChild(cont);
}

function clear_note() {
  notes.value = "";
}

function createNote() {
  // first check password
  let passwd1 = document.getElementById('passwd1');
  let passwd2 = document.getElementById('passwd2');

  if (!passwd2.value) return;

  if (passwd1.value !== passwd2.value) {
    passwd1.value = "";
    passwd2.value = "";
    // give error
    let error = document.getElementsByClassName('error')[0];
    error.textContent = "Passwords do not match!!! Please try again";
    return;
  }
  fetch('/create-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: window.location.pathname,
      passwd: passwd1.value
    })
  }).then(response => {
    remove_overlay();
  });
}

function goBack() {
  window.location.pathname = '/';
}

function checkPasswd() {
  const passwd_ip = document.getElementById('passwd');
  const passwd = passwd_ip.value;
  const path = window.location.pathname;

  if (!passwd) return;

  fetch(path + '/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      passwd: passwd
    })
  }).then(res => {
    if (res.status === 200) {
      remove_overlay();
    } else {
      //   passwd incorrect
      const error = document.getElementsByClassName('error')[0];
      error.textContent = "Incorrect Password, please try again";
      passwd_ip.value = "";
    }
  });
}

function remove_overlay() {
  const overlay = document.getElementsByClassName('over-main')[0];
  overlay.parentNode.removeChild(overlay);

  notes.style.opacity = '1';
}

document.addEventListener('DOMContentLoaded', () => {
  notes.style.opacity = '0';
  // removing the default form action
  const form = document.getElementsByTagName('form')[0];
  form.addEventListener('submit', ev => {
    ev.preventDefault();
  })
  // managing the form action
  const passwd = document.getElementById('passwd');
  const passwd1 = document.getElementById('passwd1');
  const passwd2 = document.getElementById('passwd2');

  if (passwd) passwd.focus();
  else passwd1.focus();

  [passwd, passwd2].forEach(pass => {
    pass.addEventListener('keydown', key => {
      if (key.code === 'Enter') {
        const btn = pass.parentElement.getElementsByTagName('button')[0];
        btn.click();
      }
    });
  })
});

document.body.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    save_note();
  }
});
