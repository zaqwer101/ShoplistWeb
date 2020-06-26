var example2 = new Vue
({
    el: '#example',
    data: {
      user: '',
      password: ''
    },

    methods: {
      getToken: function (event) 
      {
        if (this.user != '' && this.password != '')
        {
          axios.post('https://127.0.0.1/auth',
          {
            // POST data
            user: this.user, 
            password: this.password
          })
          .then( (response) => 
          {
            // If everything is OK
            alert(response.data.token);
          }, (error) => 
          {
            // If an error occurred
            console.log(error); 
            alert(error);
          })
        }
        else
        {
          alert('Incorrect data')
        }
      }
    }
  })