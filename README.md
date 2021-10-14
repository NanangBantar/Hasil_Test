by default after you run npm install this app will run in port 3000

url testing
// you have to login to test this app

username : Jojonomic
password : password
http://localhost:3000/ 

or make new user
{
  "iss": "Jojonomic",
  "iat": 1606696296,
  "exp": 1638232296,
  "aud": "jojonomic.com",
  "sub": "jojoarief",
  "company_id": "130",
  "user_id": "120"
  "password": "yourpasswordhere"
}
http://localhost:3000/users/create

// folder management
http://localhost:3000/document-service/folder"
http://localhost:3000/document-service/folder/:id"
http://localhost:3000/document-service/folder/:folder_id"

// document management
http://localhost:3000/document-service/document"
http://localhost:3000/document-service/document/:document_id"

// all data management
http://localhost:3000/document-service/"

// logout
http://localhost:3000/logout"