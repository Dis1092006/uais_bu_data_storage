# data-collector - Хранилище данных

----
### API справочников

* `GET /api/v1/zones` - Получить список всех зон
* `GET /api/v1/zones/:id/nodes` - Получить список всех нод указанной зоны
* `POST /api/v1/zones/:id/nodes` - Добавить ноду в указанную зону
    * _`{"name":"Нода 2"}`_
* `GET /api/v1/nodes` - Получить список всех нод
* `GET /api/v1/nodes/:id` - Получить ноду по id
* `PUT /api/v1/nodes/:id` - Обновить ноду по id
    * _`{"name":"Нода 2"}`_
* `DELETE /api/v1/nodes/:id` - Удалить ноду по id
* `GET /api/v1/servers` - Получить список всех серверов
* `POST /api/v1/servers` - Добавить сервер
    * _`{"name":"servername","alias":"serveralias"}`_
* `GET /api/v1/servers/:id` - Получить сервер по id
* `PUT /api/v1/servers/:id` - Обновить сервер по id
    * _`{"name":"servername","alias":"serveralias"}`_
* `DELETE /api/v1/servers/:id` - Удалить сервер по id

### API истории изменений архитектуры
* `POST /api/v1/history` - Добавить запись в историю
    * _`{"date":"20160328","zone":"Рабочая зона","node":"Нода 1","server":"is19-p-app-09"}`_
* `GET /api/v1/history/:date` - Получить исторические данные за указанную дату
