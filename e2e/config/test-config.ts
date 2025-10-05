export const TestConfig = {
  baseUrl: 'http://localhost:4200',
  loginUrl: 'http://localhost:4200/login',
  createEventUrl: 'http://localhost:4200/od/create-event',
  myEventsUrl: 'http://localhost:4200/od/my-events',

  testCredentials: {
    organizer: {
      email: 'od',
      password: '1',
    },
    admin: {
      email: 'admin',
      password: '1',
    },
    user: {
      email: 'user',
      password: '1',
    },
  },

  timeouts: {
    implicit: 10000,
    pageLoad: 30000,
    elementWait: 5000,
    shortWait: 2000,
  },

  // Test data
  testData: {
    event: {
      name: 'Test Event E2E',
      description: 'This is a test event created by E2E tests',
      startTime: '2025-12-25T10:00',
      endTime: '2025-12-25T18:00',
      maxGuests: 50,
      isPrivate: false,
    },
    agendaItem: {
      title: 'Test Agenda Item',
      description: 'Test agenda item description',
      location: 'Test Location',
      startTime: '2025-12-25T10:00',
      endTime: '2025-12-25T12:00',
    },
  },
};
