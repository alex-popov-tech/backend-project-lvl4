export default {
  translation: {
    title: 'Hexlet Task Manager',
    layout: {
      header: {
        title: 'Менеджер задач',
        users: 'Пользователи',
        statuses: 'Статусы',
        labels: 'Метки',
        tasks: 'Задачи',
        signin: 'Вход',
        signup: 'Регистрация',
        signout: 'Выход',
      },
    },
    welcome: {
      title: 'Taskmine',
      description: 'Best task manager ever',
      flash: {
        success: {
          registration: 'Пользователь успешно зарегистрирован',
          login: 'Вы залогинены',
          logout: 'Вы разлогинены',
        },
      },
    },
    users: {
      new: {
        title: 'Регистрация',
        form: {
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          confirm: 'Сохранить',
        },
      },
      edit: {
        title: 'Изменение пользователя',
        flash: {
          fail: 'Не удалось изменить пользователя',
        },
        form: {
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          confirm: 'Изменить',
        },
      },
      index: {
        flash: {
          fail: {
            deleteOrEditOtherUser: 'Вы не можете редактировать или удалять другого пользователя',
          },
        },
        list: {
          columns: {
            id: 'ID',
            fullName: 'Полное имя',
            email: 'Email',
            createdAt: 'Дата создания',
            action: {
              edit: 'Изменить',
              delete: 'Удалить',
            },
          },
        },
      },
    },
    session: {
      signin: {
        flash: {
          fail: 'Неправильный емейл или пароль',
        },
        title: 'Вход',
        form: {
          email: {
            title: 'Email',
          },
          password: 'Пароль',
          confirm: 'Войти',
        },
      },
    },
    statuses: {
      new: {
        title: 'Создание статуса',
        flash: {
          fail: 'Не удалось создать статус',
        },
        form: {
          name: 'Наименование',
          confirm: 'Создать',
        },
      },
      edit: {
        title: 'Изменение статуса',
        flash: {
          fail: 'Не удалось изменить статус',
        },
        form: {
          name: 'Наименование',
          confirm: 'Изменить',
        },
      },
      index: {
        add: 'Создать статус',
        flash: {
          success: {
            new: 'Статус успешно создан',
            edit: 'Статус успешно изменён',
            delete: 'Статус успешно удалнён',
          },
          fail: {
            delete: 'Не удалось удалить статус',
          },
        },
        list: {
          columns: {
            id: 'ID',
            name: 'Наименование',
            createdAt: 'Дата создания',
            action: {
              edit: 'Изменить',
              delete: 'Удалить',
            },
          },
        },
      },
    },
    labels: {
      new: {
        title: 'Создание метки',
        flash: {
          fail: 'Не удалось создать метку',
        },
        form: {
          name: 'Наименование',
          confirm: 'Создать',
        },
      },
      index: {
        add: 'Создать метку',
        flash: {
          success: {
            new: 'Метка успешно создана',
            edit: 'Метка успешно изменена',
            delete: 'Метка успешно удалена',
          },
          fail: {
            delete: 'Не удалось удалить метку',
          },
        },
        list: {
          columns: {
            id: 'ID',
            name: 'Наименование',
            createdAt: 'Дата создания',
            action: {
              edit: 'Изменить',
              delete: 'Удалить',
            },
          },
        },
      },
      edit: {
        title: 'Изменение метки',
        flash: {
          fail: 'Не удалось изменить метку',
        },
        form: {
          name: 'Наименование',
          confirm: 'Изменить',
        },
      },
    },
    tasks: {
      index: {
        add: 'Создать задачу',
        flash: {
          success: {
            edit: 'Задача успешно изменена',
            new: 'Задача успешно создана',
          },
        },
        list: {
          columns: {
            id: 'ID',
            name: 'Наименование',
            status: 'Статус',
            creator: 'Автор',
            assigned: 'Исполнитель',
            createdAt: 'Дата создания',
            labels: 'Метки',
            action: {
              edit: 'Изменить',
              delete: 'Удалить',
            },
          },
        },
      },
      new: {
        title: 'Создание задачи',
        flash: {
          fail: 'Не удалось создать задачу',
        },
        form: {
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          assigned: 'Исполнитель',
          labels: 'Метки',
          confirm: 'Создать',
        },
      },
      edit: {
        title: 'Изменение задачи',
        flash: {
          fail: 'Не удалось изменить задачу',
        },
        form: {
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          assigned: 'Исполнитель',
          labels: 'Метки',
          confirm: 'Изменить',
        },
      },
    },
  },
};
