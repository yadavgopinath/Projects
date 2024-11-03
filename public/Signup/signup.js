document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    var errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none'; 
    errorMsg.innerText = '';
  
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
  
    
    if (name === '' || email === '' || password === '') {
      errorMsg.style.display = 'block'; 
      errorMsg.innerText = 'Please fill in all the required fields!';
      return; 
    }
  
    var signupBtn = document.getElementById('signup-btn');
    var spinner = document.getElementById('loading-spinner');
  
    signupBtn.disabled = true;
    spinner.classList.remove('d-none');
  
    let data = {
      name: name,
      email: email,
      password: password
    };
  
   
 await    axios.post('http://localhost:3000/user/signup', data)
      .then(function(response) {
        var name = document.getElementById('name').value = '';
    var email = document.getElementById('email').value = '';
    var password = document.getElementById('password').value = '';
        console.log('Form submitted successfully:', response.data);
        window.location.href = '/Login/login.html';

        signupBtn.disabled = false;
        spinner.classList.add('d-none');
      })
      .catch(function(error) {
        
        
        errorMsg.style.display = 'block'; 
        errorMsg.innerText = error.response.data.message?error.response.data.message:'An error occurred. Please try again.';
        console.error('Error:', error);
        signupBtn.disabled = false;
        spinner.classList.add('d-none');
      })
     
  });