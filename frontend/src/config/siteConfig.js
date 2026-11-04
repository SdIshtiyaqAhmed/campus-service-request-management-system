const siteConfig = {
    institution: {
        name: 'SR University',
        shortName: 'SRU',
        type: 'university',
        tagline: 'Campus Service Management',

        contact: {
            email: 'SRUContact@sru.edu.in',
            phone: '+91 1234567890',
            website: 'www.sru.edu.in',
            address: 'Ananthasagar, Hasanparthy, Telangana, India'
        }
    },

    application: {
        name: 'Campus Service Management',
        shortName: 'CSM'
    },

    branding: {
        logo: '/branding/logo.png',
        favicon: '/branding/favicon.png',

        colors: {
            primary: '#2563eb',
            primaryHover: '#1d4ed8',
            primaryLight: '#eff6ff',

            secondary: '#172033',

            background: '#f5f7fb',
            surface: '#ffffff',

            text: '#172033',
            textSecondary: '#536078'
        }
    },

    authentication: {
        login: {
            enabled: true
        },

        registration: {
            enabled: true,

            roles: {
                student: true,
                staff: false,
                admin: false
            }
        }
    },

    features: {
        comments: true,
        feedback: true,
        requestClosing: true,
        requestReopening: false
    },

    terminology: {
        student: 'Student',
        students: 'Students',

        staff: 'Staff',
        administrator: 'Administrator',
        administrators: 'Administrators',

        request: 'Service Request',
        requests: 'Service Requests'
    },

    requests: {
        allowStudentCreation: true,
        allowStudentClosing: true,
        allowReopening: false,

        requireLocation: true,
        requireDescription: true,

        minimumResolutionLength: 5
    },

    dashboard: {
        welcomeMessage: 'Welcome to the Campus Service Portal'
    },

    support: {
            enabled: true,
            email: 'support@example.com',
            showContactOnLogin: true
        }
};

export default siteConfig;
