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
    models: {
      User: {
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        email: 'Email',
        password: 'Пароль',
      },
      Status: {
        name: 'Наименование',
      },
      Label: {
        name: 'Наименование',
      },
      Task: {
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        statusId: 'Статус',
        labels: 'Метки',
        labelIds: 'Метки',
        creator: 'Автор',
        executor: 'Исполнитель',
        executorId: 'Исполнитель',
      },
    },
    views: {
      auth: {
        flash: {
          fail: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
        },
      },
      buttons: {
        create: 'Создать',
        edit: 'Изменить',
        delete: 'Удалить',
        save: 'Сохранить',
        signin: 'Войти',
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
      index: {
        id: 'ID',
        createdAt: 'Дата создания',
        statuses: {
          add: 'Создать статус',
          flash: {
            success: {
              new: 'Статус успешно создан',
              edit: 'Статус успешно изменён',
              delete: 'Статус успешно удалён',
            },
            fail: {
              delete: 'Не удалось удалить статус',
            },
          },
        },
        labels: {
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
        },
        tasks: {
          add: 'Создать задачу',
          flash: {
            success: {
              edit: 'Задача успешно изменена',
              new: 'Задача успешно создана',
              delete: 'Задача успешно удалена',
            },
            fail: {
              delete: 'Не удалось удалить задачу',
            },
          },
        },
        users: {
          flash: {
            success: {
              edit: 'Пользователь успешно изменён',
              delete: 'Пользователь успешно удалён',
            },
            fail: {
              deleteOrEditOtherUser: 'Вы не можете редактировать или удалять другого пользователя',
            },
          },
          add: 'Создать пользователя',
        },
      },
      edit: {
        statuses: {
          title: 'Изменение статуса',
          flash: {
            fail: 'Не удалось изменить статус',
          },
        },
        labels: {
          title: 'Изменение метки',
          flash: {
            fail: 'Не удалось изменить метку',
          },
        },
        tasks: {
          title: 'Изменение задачи',
          flash: {
            fail: 'Не удалось изменить задачу',
          },
        },
        users: {
          title: 'Изменение пользователя',
          flash: {
            fail: 'Не удалось изменить пользователя',
          },
        },
      },
      new: {
        statuses: {
          title: 'Создание статуса',
          flash: {
            fail: 'Не удалось создать статус',
          },
        },
        labels: {
          title: 'Создание метки',
          flash: {
            fail: 'Не удалось создать метку',
          },
        },
        tasks: {
          title: 'Создание задачи',
          flash: {
            fail: 'Не удалось создать задачу',
          },
        },
        users: {
          title: 'Регистрация',
        },
        session: {
          title: 'Вход',
          flash: {
            fail: 'Неправильный емейл или пароль',
          },
        },
      },
    },
  },
};
