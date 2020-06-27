var example2 = new Vue({
  el: '#example',
  data: {
    address: '127.0.0.1',
    user: '',
    password: '',
    token: '',
    items: [],
    bought: []
  },

  methods: {
    getToken: function(event) {
      if (this.user != '' && this.password != '') {
          axios.post('https://' + this.address + '/auth', {
            // POST data
            user: this.user, 
            password: this.password
          })

          .then( (response) => {
            // If everything is OK
            this.token = response.data.token
            console.log('Token: ' + this.token)
          }, 
          
          (error) => {
      // If an error occurred
      this.token = ''
      console.log(error);
      alert('Can not get token');
          })
      } else {
        alert('Incorrect data');
      }
    },
    getItems: function(event) {
      if (this.token == '') {
        // If token was not set
        this.getToken(null)
        if (this.token == '') return
      }
      axios.get('https://' + this.address + '/shoplist?token=' + this.token)
          .then(
              (response) => {
                // if ok
                this.items = response.data;
                this.items.forEach(item => {
                  console.log('Item - ' + item.name + ':' + item.bought)
                  if (item.bought == 'true') {
                    this.bought.push(item.name)
                  }
                });
              },
              (error) => {
                alert('Can not get items');
                console.log(error)
              })
    }
  }
})
