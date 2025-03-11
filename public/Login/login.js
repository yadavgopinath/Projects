
  
document.getElementById('login-form').addEventListener('submit', async function(e) { 
  e.preventDefault();

  var errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none'; 
    errorMsg.innerText = '';
    errorMsg.style.color = 'white';
  
   
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
  
    
    if ( email === '' || password === '') {
      errorMsg.style.display = 'block'; 
      errorMsg.innerText = 'Please fill in all the required fields!';
      return; 
    }



   

    
    let data = {
      email: email,
      password: password
    };
    await  axios.post('http://localhost:3200/user/login', data)
      .then(function(response) {
        var email = document.getElementById('email').value = '';
        var password = document.getElementById('password').value = '';
        //console.log(response.data);
        if(response.status===200)
        {
         // errorMsg.style.display = 'block';
          //errorMsg.style.color = 'green';
         alert(`${response.data.message}`);
        if(response.data.token){
          localStorage.setItem('token',response.data.token)
        }
        window.location.href = '/Expensetracker/expenses.html'; // Adjust the path as necessary

          
         // errorMsg.innerText = `${response.data.message}`;
        }
      
       
      })
      .catch(function(error) {
      
        
        
          const errorMsgText = error.response && error.response.status
      ? error.response.status === 401
        ? 'Incorrect password. Please try again.'
        : error.response.status === 404
        ? 'Email does not exist.'
        : 'An error occurred. Please try again.'
      : 'A network error occurred. Please try again.';
      errorMsg.style.display = 'block';
      errorMsg.innerText = errorMsgText;
        
      })
     
  });





