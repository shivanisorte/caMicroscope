const store = new Store('../../data/');

async function populateUserTable(){
  // todo use await store instead
  let collections = await store.getAllCollection()

  let users = await store.getUsers();

  // map between collection id and name
  let collectionMap = {}
  for (let i of collections){
    collectionMap[i['_id']['$oid']] = i['name']
  }

  // cleaned user data for the table
  let usersClean = []
  for (let i of users){
    let u = {};
    u['Name'] = i.registration.firstName + " " + i.registration.lastName
    u['Email'] = i.email
    u['Institution'] = i.registration.institutionOfEmployment
    u['Type'] = i.userType
    u['Collections'] = ""
    let user_collections = i.collections || []
    for(j of user_collections){
      u['Collections'] += collectionMap[j] || j
      u['Collections'] += ", "
    }
    // remove last comma and space
    u['Collections'] = u['Collections'].slice(0,-2)
    usersClean.push(u)
  }

  // populate table with usersClean result

  for (user of usersClean){
    let tr = document.createElement("tr");
    let name_td = document.createElement("td");
    name_td.innerText = user['Name']
    tr.appendChild(name_td);
    let institution_td = document.createElement("td");
    institution_td.innerText = user['Institution']
    tr.appendChild(institution_td);
    let email_td = document.createElement("td");
    email_td.innerText = user['Email']
    tr.appendChild(email_td);
    let type_td = document.createElement("td");
    type_td.innerText = user['Type']
    tr.appendChild(type_td);
    let collections_td = document.createElement("td");
    collections_td.innerText = user['Collections']
    tr.appendChild(collections_td);
    // edit button
    let edit_td = document.createElement("td");
    let edit_btn = document.createElement("button")
    edit_btn.innerText = "Edit"
    edit_btn.type = "button"
    edit_btn.classList.add("btn", "btn-primary")
    edit_btn.onclick = () => {window.location = "./editUser.html?email=" + user['Email']}
    edit_td.appendChild(edit_btn)
    tr.appendChild(edit_td);

    document.getElementById("user_table_body").appendChild(tr);
  }
  // initialize user table
  $('#user_table').DataTable();
}

async function downloadUsers(){
  let users = await store.getUsers();
  let collections = await store.getAllCollection()
  // map between collection id and name
  let collectionMap = {}
  for (let i of collections){
    collectionMap[i['_id']['$oid']] = i['name']
  }

  // cleaned user data for the table
  let usersClean = []
  for (let i of users){
    let u = {};
    u['id'] = i['_id']['$oid']
    u['firstName'] = i.registration.firstName
    u['lastName'] = i.registration.lastName
    u['email'] = i.email
    u['institution'] = i.registration.institutionOfEmployment
    u['userType'] = i.userType
    u['collections'] = []
    let user_collections = i.collections || []
    for(j of user_collections){
      u['collections'].push(collectionMap[j])
    }
    usersClean.push(u)
  }
  // download the file
  console.log(usersClean)
  const blob = new Blob([JSON.stringify(usersClean, undefined, 2)], { type: "text/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'htt-users.json';
  a.click();
  window.URL.revokeObjectURL(url);
}

function handleUpload(){
  function onReaderLoad(event){
      console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      uploadUsers(obj);
  }
  var reader = new FileReader();
  reader.onload = onReaderLoad;
  if (document.getElementById("manifest_in").files.length){
    reader.readAsText(document.getElementById("manifest_in").files[0]);
  } else {
    alert("include a user manifest file for upload")
  }
}

async function uploadUsers(data){
  let collections = await store.getAllCollection()
  // map between collection id and name
  let revCollectionMap = {}
  for (let i of collections){
    revCollectionMap[i['name']] = i['_id']['$oid']
  }
  let editUsers = data || [];
  for (let i of editUsers){
    let edit = {}
    edit.registration = {}
    edit.registration.firstName = i['firstName']
    edit.registration.lastName = i['lastName']
    edit.registration.email = i['email']
    edit.email = i['email']
    edit.registration.institutionOfEmployment = i['institution']
    edit.userType = i['userType']
    // collections
    edit.collections = []
    let user_collections = i['collections'] || [];
    for (let j of user_collections){
      edit.collections.push(revCollectionMap[j])
    }
    let res = await store.updateUser(i['id'], edit)
    console.log(edit)
  }
  alert("updated " + editUsers.length + " users")
}

document.getElementById("downloadUsers").onclick = downloadUsers;
document.getElementById("uploadUsers").onclick = handleUpload;