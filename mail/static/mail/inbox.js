
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

   // Compose and Reply event listeners
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    send_email(event)});

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

function reply(email_id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(data => {
    const email = data;
    document.querySelector('#compose-recipients').value = email["sender"];
    if (email["subject"].startsWith('Re:')){
      document.querySelector('#compose-subject').value = email["subject"];
    }else{
      document.querySelector('#compose-subject').value = `Re: ${email["subject"]}`;
    }
    document.querySelector('#compose-body').value = `\n\n-----------------\n\nOn ${email["timestamp"]} \n${email["sender"]} wrote:\n${email["body"]}`;
  })  
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
    data.forEach(email => add_email(email,mailbox));
  });
}

function add_email(email,mailbox){
  const new_email = document.createElement('div');
  new_email.className = 'border border-secondary-subtle';
  new_email.addEventListener('click',() => view_email(email["id"]));
  new_email.style.cursor = 'grab';
  new_email.style.display = 'flex';
  
  const inside_class='d-inline-block w-25';
  
  const sender_receiver = document.createElement('div');
  if (mailbox==='sent'){
    sender_receiver.innerHTML = `<strong>To: ${email["recipients"]}</strong>`;
  }else{
    sender_receiver.innerHTML = `<strong>${email["sender"]}</strong>`;
  }
  sender_receiver.className = inside_class;
  sender_receiver.style.whiteSpace = 'nowrap';
  sender_receiver.style.overflow = 'hidden';
  sender_receiver.style.textOverflow = 'ellipsis';

  const subject = document.createElement('div');
  subject.innerHTML = `${email["subject"]}`;
  subject.className = inside_class;

  const timestamp = document.createElement('div');
  timestamp.innerHTML = `${email["timestamp"]}`;
  timestamp.className = inside_class;

  if (email["read"] === true){
    new_email.style.backgroundColor = '#EDEDED';
  }
 
  const view = document.querySelector('#emails-view');
  
  new_email.append(sender_receiver,subject,timestamp);
  view.append(new_email);

  if (mailbox!=='sent'){
    var button = document.createElement('button');
    button.className = "btn btn-sm btn-outline-primary d-inline-block w-10";
    if (email["archived"] === true){
      button.innerHTML = 'Unarchive';
    } else {
      button.innerHTML = 'Archive';
    }
    new_email.append(button);
    button.addEventListener('click',(event) => {
      event.stopPropagation();
      archiviation(email["id"]);
      new_email.style.display = 'none';
      setTimeout(() => {
        load_mailbox('inbox');
      },100);
    });
  }
  
}

function send_email(event) {
  event.preventDefault();

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
  setTimeout(() => {
    load_mailbox('sent');
  },100);
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
  });

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(data => { 
    const email_info = data;
    console.log(email_info);
    document.querySelector('#from').innerHTML = "From: " + email_info["sender"];
    document.querySelector('#to').innerHTML = "To: " + email_info["recipients"];
    document.querySelector('#subject').innerHTML = email_info["subject"];
    document.querySelector('#timestamp').innerHTML = email_info["timestamp"];
    const formatted_body = email_info["body"].replace(/\n/g,'<br>');
    document.querySelector('#content').innerHTML = formatted_body;
    document.querySelector('#reply').addEventListener('click',() => reply(email_info["id"]));
  });

}

function archiviation(email_id) {

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(data =>{
     archived = data["archived"];
  
    fetch(`emails/${email_id}`,{
      method: 'PUT',
      body: JSON.stringify({
      archived: !archived
    })
    });
  });
  
}