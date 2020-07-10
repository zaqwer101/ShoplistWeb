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
          .catch(err => console.error(err))
      }

      if (method == 'get') {
        return axios.get(this.address + endpoint + '?' + data)
          .then(r => r)
          .catch(err => console.error(err))
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

    // получить и заполнить список предметов
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
            if (r.data.length != 0) console.log("Список предметов:")
            r.data.forEach(item => {
              console.log(item.name + ": " + item.bought);
              this.items.push(item);
              if (item.bought == 'true') this.bought.push(item.name);
            });
          })
      }
    },

    register: function() {

    },

    onCheck: function(event) {

    },

    deleteItem: function(event) {

    }
  }
})