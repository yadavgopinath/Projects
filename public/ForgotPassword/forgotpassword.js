document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    var errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none'; 
    errorMsg.innerText = '';

    var email = document.getElementById('email').value;
    
    if (email === '') {
      errorMsg.style.display = 'block'; 
      errorMsg.innerText = 'Please enter your email!';
      return;
    }

    let data = {
      email: email
    };

    await axios.post('http://54.221.110.84:3000/password/forgotpassword', data)
      .then(function(response) {
        alert("Reset-Password Link has been send on given email-id");
        document.getElementById('email').value = '';
      })
      .catch(function(error) {
        const errorMsgText = error.response && error.response.status === 404
          ? 'Email not found. Please try again.'
          : 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
        errorMsg.innerText = errorMsgText;
      });
  });