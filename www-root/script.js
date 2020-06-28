var example2 = new Vue({
  el: '#example',
  data: {
    address: 'https://127.0.0.1',
    user: '',
    password: '',
    token: '',
    items: [],
    bought: [],
  },

  methods: {
    getToken: function(event) {
      if (this.user != '' && this.password != '') {
          axios.post(this.address + '/auth', {
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
        this.getToken(this);
        return
      }
      axios.get(this.address + '/shoplist?token=' + this.token)
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
    },

    deleteItem: function(event) {
      itemName = event.target.id.split('_')[1];
      console.log(itemName + ' clicked delete');
      axios.delete(
          this.address + '/shoplist',
          {data: {token: this.token, name: itemName}});
      this.getItems();
    },

    onCheck: function(event) {
      checked = 'false';
      if (this.bought.includes(event.target.id)) {
        console.log(event.target.id + ' checked');
        checked = 'true';
      } else {
        console.log(event.target.id + ' unchecked');
        checked = 'false';
      }

      axios.post(this.address + '/shoplist/bought', {
        // POST data
        token: this.token,
        name: event.target.id,
        bought: checked
      })
    }
  }
})
