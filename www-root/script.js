var example2 = new Vue({
  el: '#shoplist',
  data: {
    address: 'https://127.0.0.1',
    user: '',
    password: '',
    token: '',
    items: [],
    bought: [],
  },

  methods: {

    // сделать запрос к API
    request: function(endpoint, method, data) {
      if (method == 'post') {
        return axios.post(this.address + endpoint, data)
        .then(r => r)
        .catch(err => console.error(err));
      }

      if (method == 'get') {
        return axios.get(this.address + endpoint + '?' + data)
        .then(r => r)
        .catch(err => console.error(err));
      }

      if (method == 'delete') {
        return axios.delete(this.address + endpoint, {data: data})
        .then(r => r)
        .catch(err => console.error(err));
      }
    },

    // получить токен
    getToken: function(func = null /* функция, которую выполнить после получения токена */) {
      this.request('/auth', 'post', { user: this.user, password: this.password })
      .then(r => {
        this.token = r.data.token;
        console.log("Токен: " + r.data.token);
        if (func != null) func();
      })
      .catch(err => { 
        alert("Аутентификация не удалась!")
      })
    }, 

    // провести аутентификацию и показать основную форму
    auth: function() {
      if (this.user != '' && this.password != '') {
        this.getItems(); // getItems уже позовёт getToken, если токена нет
      }
    },

    // получить и заполнить список элементов
    getItems: function() {
      if (this.token == '') {
        console.log("Токен не задан");
        this.getToken(this.getItems);
        if (this.token == '') {
          return;
        }
      } else {
        this.request('/shoplist', 'get', 'token=' + this.token)
        .then(r => {
          if (r.data.length != 0) console.log("Список элементов:")
          this.items = r.data;
          r.data.forEach(item => {
            console.log(item.name + ": " + item.bought);
            if (item.bought == 'true') this.bought.push(item.name);
          });
        })
      }
    },

    register: function() {

    },

    // функция, вызываемая при чеке элемента
    onCheck: function(event) {
      checked = 'false';
      if (this.bought.includes(event.target.id)) {
        console.log(event.target.id + ' checked');
        checked = 'true';
      } else {
        console.log(event.target.id + ' unchecked');
        checked = 'false';
      }

      this.request('/shoplist/bought', 'post', {
        token: this.token,
        name: event.target.id,
        bought: checked
      })
    },

    // удаление элемента
    deleteItem: function(event) {
      itemName = event.target.id.split('_')[1];
      console.log(itemName + ' clicked delete');
      this.request('/shoplist', 'delete', {
        token: this.token,
        name: itemName 
      });
      this.getItems();
    }
  }
})