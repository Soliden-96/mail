
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

   // Compose email event listener
  document.querySelector('#compose-form').addEventListener('submit', () => send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

 
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch mailbox data
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    data.forEach(email => add_email(email));
  });
}

function add_email(email){
  const new_email = document.createElement('div');
  new_email.className = 'border border-secondary-subtle';
  new_email.addEventListener('click',() => view_email(email["id"]));
  
  const inside_class='d-inline-block w-25';
  
  const sender = document.createElement('div');
  sender.innerHTML = `<strong>${email["sender"]}</strong>`;
  sender.className = inside_class;

  const subject = document.createElement('div');
  subject.innerHTML = `${email["subject"]}`;
  subject.className = inside_class;

  const timestamp = document.createElement('div');
  timestamp.innerHTML = `${email["timestamp"]}`;
  timestamp.className = inside_class;

  if (email["read"] === true){
    new_email.style.backgroundColor = '#FAF0E6';
  }
 
  const view = document.querySelector('#emails-view');
  
  new_email.append(sender,subject,timestamp);
  view.append(new_email);
}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails',{
      method:'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
  .then(response=>response.json())
  .then(result=>{
    console.log(result);
  });
  
  load_mailbox('sent');
  return false;
}

function view_email(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  fetch(`emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read:true
    })
  })

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(data => { 
    const email_info = data;
    console.log(email_info);
    document.querySelector('#from').innerHTML = "From: " + email_info["sender"];
    document.querySelector('#to').innerHTML = "To: " + email_info["recipients"];
    document.querySelector('#subject').innerHTML = email_info["subject"];
    document.querySelector('#timestamp').innerHTML = email_info["timestamp"];
    document.querySelector('#content').innerHTML = email_info["body"];
  })
}