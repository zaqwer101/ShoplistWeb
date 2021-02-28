var example2 = new Vue({
  el: '#shoplist',
  data: {
    address: 'https://127.0.0.1',
    user: '',
    password: '',
    itemName: '',
    itemShop: null,
    token: '',
    items: [],
    bought: [],
    token_ttl: 0,  // время жизни токена
    token_date: 0  // unixtime время получения токена
  },

  created: function () {
    console.log("Инстанс ожил");
    this.getServerInfo();
    if (this.loadToken()) {
      this.getItems();
    }
  },

  methods: {

    // сделать базовый запрос к API
    request: function(endpoint, method, data = null) {
      if (method == 'post') {
        return axios.post(this.address + endpoint, data)
        .then(r => r)
        .catch(err => console.error(err));
      }

      if (method == 'get') {
        if (data != null) {
          return axios.get(this.address + endpoint + '?' + data)
            .then(r => r)
            .catch(err => console.error(err));
        }
        else {
          return axios.get(this.address + endpoint)
            .then(r => r)
            .catch(err => console.error(err));
        }
      }

      if (method == 'delete') {
        return axios.delete(this.address + endpoint, {data: data})
        .then(r => r)
        .catch(err => console.error(err));
      }
    },

    // сделать запрос с авторизацией
    authorizedRequest: function(endpoint, method, data = null)
    {
      var timeDiff = parseInt(Date.now() / 1000) - this.token_date;
      console.log("TTL токена - " + this.token_ttl)
      console.log("С момента получения токена прошло " + timeDiff);

      if (!this.isTokenValid()) { // значит токен не токен, получаем новый
        console.log("Токену осталось жить " + (this.token_ttl - timeDiff))
        this.getToken();
      }
      
      var rdata;
      if (method == 'post' || method == 'delete') { // если запрос POST/DELETE - добавляем токен в данные
        rdata = data;
        rdata.token = this.token; 
      } else { // если запрос не POST/DELETE - добавляем токен в аргументы
        if (rdata != null) rdata = data + "&token=" + this.token;
        else rdata = "token=" + this.token;
      }
      console.log("Изначальные данные запроса - " + data);
      console.log("Итоговые данные запроса - " + rdata); 

      return this.request(endpoint, method, rdata)
    },

    // получить токен
    getToken: function(func = null /* функция, которую выполнить после получения токена */) {
      this.request('/auth', 'post', { user: this.user, password: this.password })
      .then(r => {
        this.token = r.data.token;
        console.log("Токен: " + r.data.token);
        this.saveToken();
        if (func != null){
          func();
        }
      })
      .catch(err => { 
        alert("Аутентификация не удалась!")
      })
    }, 

    // провести аутентификацию и показать основную форму
    auth: function() {
      if (this.user != '' && this.password != '') {
        this.getToken(this.getItems); 
      }
    },

    // регистрация нового пользователя
    register: function() {
      if (this.user != '' && this.password != '') {
        this.request('/register', 'post', {
          user: this.user, 
          password: this.password
        }).then(
          () => { 
            this.getItems(); 
            this.saveToken();
          }
        );
      } else {
        alert("Регистрация не удалась");
      }
    },

    // получить и заполнить список элементов
    getItems: function() {
      this.authorizedRequest('/shoplist', 'get')
      .then(r => {
        if (r.data.length != 0) console.log("Список элементов:")
        this.items = r.data;
        r.data.forEach(item => {
          console.log(item.name + " x" + item.bought + ": " + item.shop);
          if (item.bought == 'true') this.bought.push(item.name);
        });
      })
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

      this.authorizedRequest('/shoplist/bought', 'post', {
        name: event.target.id,
        bought: checked
      })
    },

    // удаление элемента
    deleteItem: function(event) {
      itemName = event.target.id.split('_')[1];
      console.log(itemName + ' clicked delete');
      this.authorizedRequest('/shoplist', 'delete', {
        name: itemName, shop: itemShop}).then(
        () => {
          this.getItems();
        }
      );
    }, 

    // добавить элемент
    addItem: function() {
      if (this.itemName == '') alert('Имя не может быть пустым')
      else {
        this.authorizedRequest('/shoplist', 'post', { name: this.itemName, shop: this.itemShop })
        .then(() => {
          this.getItems();
        });
      }
    }, 

    saveToken: function() {
      this.token_date = parseInt(Date.now() / 1000);
      localStorage.token = this.token; 
      localStorage.token_date = this.token_date;
      console.log("Токен сохранен: " + this.token_date);
    }, 

    loadToken: function() {
      if (localStorage.token) {
        this.token = localStorage.token;
        this.token_date = Number(localStorage.token_date); 
        this.token_ttl = Number(localStorage.token_ttl);
        console.log("Токен загружен");
        return true;
      } 
      console.log("Не удалось загрузить токен");
      return false;
    },

    getServerInfo: function() {
      console.log("Получаем информацию о сервере");
      if (this.token_ttl == 0) // значит надо получить ttl токена
      {
        this.request('/info', 'get').then( r => {
          this.token_ttl = Number(r.data.auth.token_ttl); 
          localStorage.token_ttl = this.token_ttl;
          console.log("Получен TTL токена - " + this.token_ttl);
        })
      }
    },

    isTokenValid: function() {
      var timeDiff = parseInt(Date.now() / 1000) - this.token_date;
      return timeDiff < this.token_ttl && this.token != '';
    }
  }
})
