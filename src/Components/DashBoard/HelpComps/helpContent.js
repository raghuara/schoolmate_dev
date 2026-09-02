import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

export const SUPPORT = {
  email: 'hello@araschoolmate.com',
  phone: '+91 81100 151152',
  hours: 'Monday to Friday, 10:00 AM - 6:00 PM',
};

const BASE = '/dashboardmenu';

export const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    caption: 'Login, profile and finding your way around SchoolMate',
    icon: RocketLaunchOutlinedIcon,
    color: '#EEA200',
    bg: '#FFF7E5',
    topics: [
      {
        id: 'gs-basics',
        title: 'The Basics',
        articles: [
          {
            id: 'gs-login',
            q: 'How do I log in to SchoolMate?',
            popular: true,
            steps: [
              'Open the SchoolMate web address shared by your school.',
              'Enter your login ID and your password.',
              'Click Login. You land on the dashboard meant for your role.',
            ],
            note: 'Your login ID is issued by the school. If you do not have one, ask your admin.',
            video: null,
          },
          {
            id: 'gs-parent-login',
            q: 'How does a parent log in?',
            steps: [
              'The login ID is the student roll number in most schools.',
              'The password is the same roll number to begin with.',
              'Log in once, then change the password to something private.',
            ],
            note: 'A parent with more than one child in the school sees all of them under a single login once the siblings are merged.',
            video: null,
          },
          {
            id: 'gs-forgot-password',
            q: 'I forgot my password. What should I do?',
            steps: [
              'Click Forgot Password on the login screen.',
              'Enter your registered mobile number or email and verify the OTP.',
              'Set a new password and log in again.',
            ],
            note: 'An admin can also reset it from Access Control > Users > Passwords.',
            route: BASE + '/access/password',
            video: null,
          },
          {
            id: 'gs-missing-menu',
            q: 'Why can I not see some menus in the sidebar?',
            popular: true,
            rank: 4,
            steps: [
              'SchoolMate shows only the modules your role is allowed to use.',
              'Ask your admin to open Access Control > Roles and Permissions.',
              'The module and the action (view, create, edit, delete) must be switched on for your role.',
              'Log out and log in again for the new permissions to take effect.',
            ],
            video: null,
          },
          {
            id: 'gs-topbar',
            q: 'What are the icons in the top bar?',
            steps: [
              'The first dropdown is the academic year you are working in.',
              'The bell shows notifications and approvals waiting for you.',
              'The speech bubble opens Chats with its unread count.',
              'The question mark opens this Help and Support panel.',
              'Your avatar opens Profile, Settings and Logout.',
            ],
            video: null,
          },
          {
            id: 'gs-academic-year',
            q: 'How do I switch the academic year?',
            steps: [
              'Use the academic year dropdown at the left of the top bar.',
              'Pick the year you want to work in.',
              'Lists, marks, attendance and fees all reload for that year.',
            ],
            note: 'New records can normally be created only in the active academic year.',
            video: null,
          },
          {
            id: 'gs-profile',
            q: 'How do I update my profile photo and details?',
            steps: [
              'Click your avatar at the top right corner.',
              'Choose Profile from the menu.',
              'Update your photo and contact details, then Save.',
            ],
            note: 'Your name, role and permissions are controlled by the school admin.',
            route: BASE + '/profile',
            video: null,
          },
          {
            id: 'gs-logout',
            q: 'How do I log out on a shared computer?',
            steps: [
              'Click your avatar at the top right.',
              'Choose Logout and confirm.',
              'Never leave the browser signed in on a staff room or lab machine.',
            ],
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'communication',
    title: 'Communication',
    caption: 'News, messages, circulars, consent forms, feedback and chats',
    icon: CampaignOutlinedIcon,
    color: '#E30053',
    bg: '#FFF1F5',
    mainMenus: ['communication'],
    topics: [
      {
        id: 'comm-basics',
        title: 'Posting Basics',
        articles: [
          {
            id: 'comm-difference',
            q: 'What is the difference between News, Circular, Message and Notification?',
            popular: true,
            steps: [
              'News is a general school update meant for a wide audience.',
              'Circular is an official notice, usually with an attachment that parents acknowledge.',
              'Message is a targeted note to a class, a section, or chosen students and parents.',
              'Notification is a short push alert on the parent app, with no post behind it.',
            ],
            video: null,
          },
          {
            id: 'comm-audience',
            q: 'How do I choose who receives a post?',
            steps: [
              'On any create screen, open the audience section.',
              'Pick everyone, or select grades, or drill down to specific sections.',
              'For messages you can also pick individual students.',
              'Review the selected count before publishing.',
            ],
            video: null,
          },
          {
            id: 'comm-not-visible',
            q: 'My post is not visible to parents. Why?',
            popular: true,
            rank: 5,
            steps: [
              'Check whether it is still waiting in Approvals.',
              'Confirm the audience you selected actually covers those parents.',
              'Check the scheduled publish date and time on the post.',
              'Make sure it was published and not left unsent.',
            ],
            route: BASE + '/status',
            video: null,
          },
          {
            id: 'comm-read-tracking',
            q: 'How do I know who has read my post?',
            steps: [
              'Open the published news, message or circular from its list.',
              'Click the view tracking option on the post.',
              'You see the read and unread list by student and parent.',
            ],
            video: null,
          },
          {
            id: 'comm-schedule',
            q: 'Can I schedule a post for a later date?',
            steps: [
              'While creating the post, set the publish date and time.',
              'Save and publish it as usual.',
              'It waits in Scheduled and goes out automatically at that time.',
            ],
            route: BASE + '/schedule',
            video: null,
          },
        ],
      },
      {
        id: 'comm-dashboard',
        title: 'Communication Dashboard',
        articles: [
          {
            id: 'comm-dash-what',
            q: 'What does the Communication Dashboard show?',
            steps: [
              'Open Communication > Dashboard.',
              'It summarises what your school has sent recently across news, messages and circulars.',
              'Use it to check reach and engagement at a glance before you post again.',
            ],
            route: BASE + '/com-dashboard',
            video: null,
          },
        ],
      },
      {
        id: 'comm-news',
        title: 'News',
        articles: [
          {
            id: 'comm-news-create',
            q: 'How do I post news?',
            popular: true,
            rank: 1,
            steps: [
              'Open Communication > News from the sidebar.',
              'Click Create News at the top right.',
              'Enter the title and description, and upload an image if needed.',
              'Choose the audience: everyone, selected grades, or specific sections.',
              'Click Publish.',
            ],
            note: 'If approval is switched on for News, it goes to the approver before parents can see it.',
            route: BASE + '/news',
            video: null,
          },
          {
            id: 'comm-news-edit',
            q: 'How do I edit news that is already published?',
            steps: [
              'Open Communication > News and find the post.',
              'Click Edit on the post.',
              'Make your changes and save.',
            ],
            note: 'If approval is on, the edited version goes back to the approver before it reaches parents again.',
            route: BASE + '/news',
            video: null,
          },
          {
            id: 'comm-news-image',
            q: 'What image size should I use for news?',
            steps: [
              'Use a landscape image so it fills the card in the parent app.',
              'Keep the file small so it loads quickly on a phone.',
              'Avoid putting important text inside the image, as it may be cropped.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-messages',
        title: 'Messages',
        articles: [
          {
            id: 'comm-msg-class',
            q: 'How do I send a message to one class only?',
            popular: true,
            steps: [
              'Open Communication > Messages.',
              'Click Create Message.',
              'Select the grade and section.',
              'Type the message, attach a file if needed, and send.',
            ],
            route: BASE + '/messages',
            video: null,
          },
          {
            id: 'comm-msg-student',
            q: 'How do I message a single student or parent?',
            steps: [
              'Open Communication > Messages and click Create Message.',
              'Select the grade and section, then switch to picking individual students.',
              'Tick only the students you want and send.',
            ],
            route: BASE + '/messages',
            video: null,
          },
          {
            id: 'comm-msg-vs-chat',
            q: 'When should I use Messages instead of Chats?',
            steps: [
              'Messages is one way: you announce something and it is tracked and approved.',
              'Chats is a two way conversation with a parent or staff member.',
              'Use Messages for anything official you may need a record of.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-circulars',
        title: 'Circulars',
        articles: [
          {
            id: 'comm-circ-create',
            q: 'How do I publish a circular?',
            steps: [
              'Open Communication > Circulars and click Create.',
              'Enter the title and content, and attach the circular PDF.',
              'Select the grades or sections that should receive it.',
              'Publish. Parents can then open and acknowledge it from the app.',
            ],
            route: BASE + '/circulars',
            video: null,
          },
          {
            id: 'comm-circ-ack',
            q: 'How do I check who acknowledged a circular?',
            steps: [
              'Open the circular from the Circulars list.',
              'Open its tracking view.',
              'You see acknowledged and pending parents, which you can export.',
            ],
            route: BASE + '/circulars',
            video: null,
          },
        ],
      },
      {
        id: 'comm-consent',
        title: 'Consent Forms',
        articles: [
          {
            id: 'comm-consent-create',
            q: 'How do I create a consent form?',
            steps: [
              'Open Communication > Consent Forms and click Create.',
              'Add the questions with their answer options.',
              'Set the last date for parents to respond.',
              'Select the audience and publish the form.',
            ],
            route: BASE + '/consentforms',
            video: null,
          },
          {
            id: 'comm-consent-responses',
            q: 'Where do I see the consent form responses?',
            steps: [
              'Open the form from the Consent Forms list.',
              'Switch to the responses view.',
              'Filter by grade or section, and export to Excel if you need a list.',
            ],
            route: BASE + '/consentforms',
            video: null,
          },
          {
            id: 'comm-consent-reminder',
            q: 'Parents have not responded. Can I remind them?',
            steps: [
              'Open the form and check the pending list.',
              'Send a message or notification to those classes pointing to the form.',
              'Extend the last date if the deadline has already passed.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-feedback',
        title: 'Feedback',
        articles: [
          {
            id: 'comm-fb-create',
            q: 'How do I collect feedback from parents?',
            steps: [
              'Open Communication > Feedback and click Create.',
              'Add your questions and choose the answer type for each.',
              'Select the audience and publish.',
            ],
            route: BASE + '/feedback',
            video: null,
          },
          {
            id: 'comm-fb-responses',
            q: 'How do I read the feedback responses?',
            steps: [
              'Open Communication > Feedback.',
              'Open the Responses screen for that form.',
              'Review answer by answer, or export the whole set.',
            ],
            route: BASE + '/feedback/responses',
            video: null,
          },
        ],
      },
      {
        id: 'comm-calendar',
        title: 'School Calendar',
        articles: [
          {
            id: 'comm-cal-add',
            q: 'How do I add a holiday or an event to the calendar?',
            steps: [
              'Open Communication > School Calendar.',
              'Click the date you want and add the event or holiday.',
              'Choose whether it applies to the whole school or selected grades.',
              'Save. It appears in the parent app calendar.',
            ],
            route: BASE + '/schoolcalendar',
            video: null,
          },
          {
            id: 'comm-cal-attendance',
            q: 'Do calendar holidays affect attendance?',
            steps: [
              'Days marked as holidays are not counted as working days.',
              'Attendance percentages are calculated on working days only.',
              'Mark holidays before the month closes so the reports stay correct.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-birthday',
        title: 'Birthday Post',
        articles: [
          {
            id: 'comm-bday-how',
            q: 'How does the Birthday Post work?',
            steps: [
              'Open Communication > Birthday Post.',
              'It lists students whose birthday falls on the selected date.',
              'Pick a template, review the message and post it.',
            ],
            route: BASE + '/birthday-post',
            video: null,
          },
        ],
      },
      {
        id: 'comm-notification',
        title: 'Notification',
        articles: [
          {
            id: 'comm-notif-send',
            q: 'How do I send a push notification?',
            steps: [
              'Open Communication > Notification.',
              'Write a short title and message.',
              'Select the audience and send.',
            ],
            note: 'You need create permission on Notification for this screen to appear.',
            route: BASE + '/notification',
            video: null,
          },
          {
            id: 'comm-notif-missing',
            q: 'A parent says they did not get the notification',
            steps: [
              'Check that the parent has installed the app and logged in at least once.',
              'Ask them to allow notifications for the app in their phone settings.',
              'Confirm the audience you selected included that student.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-chats',
        title: 'Chats',
        articles: [
          {
            id: 'comm-chat-start',
            q: 'How do I start a chat?',
            steps: [
              'Click the chat icon in the top bar, or open Communication > Chats.',
              'Search for the staff member or parent.',
              'Open the conversation and send your message.',
            ],
            route: BASE + '/chats',
            video: null,
          },
          {
            id: 'comm-chat-unread',
            q: 'What is the red number on the chat icon?',
            steps: [
              'It is the count of conversations with unread messages.',
              'It clears as you open each conversation.',
            ],
            video: null,
          },
        ],
      },
      {
        id: 'comm-contact',
        title: 'Contact Details',
        articles: [
          {
            id: 'comm-contact-update',
            q: 'How do I update the school contact details parents see?',
            steps: [
              'Open Communication > Contact Details.',
              'Update the phone numbers, email and address.',
              'Save. The parent app shows the new details.',
            ],
            route: BASE + '/contact',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'academics',
    title: 'Academics',
    caption: 'Timetables, homework, exams, marks, attendance and question papers',
    icon: MenuBookOutlinedIcon,
    color: '#3457D5',
    bg: '#EEF2FF',
    mainMenus: ['communication'],
    topics: [
      {
        id: 'acad-timetable',
        title: 'Timetables',
        articles: [
          {
            id: 'acad-tt-create',
            q: 'How do I create a class timetable?',
            popular: true,
            rank: 11,
            steps: [
              'Open Academics > Timetables and click Create.',
              'Select the grade and section.',
              'Click a period cell and choose the subject and the teacher.',
              'Repeat for every period and Save.',
            ],
            note: 'If that teacher is already booked for the same period in another class, SchoolMate warns you before saving.',
            route: BASE + '/timetables',
            video: null,
          },
          {
            id: 'acad-tt-teacher',
            q: 'How do I see or create a teacher timetable?',
            steps: [
              'Open Academics > Timetables.',
              'Switch to the teacher timetable view.',
              'Pick the teacher to see every class they take across the week.',
            ],
            route: BASE + '/timetables',
            video: null,
          },
          {
            id: 'acad-tt-edit',
            q: 'How do I change one period in a published timetable?',
            steps: [
              'Open Academics > Timetables and open that class.',
              'Click Edit and change only the period you need.',
              'Save. Students and parents see the updated timetable straight away.',
            ],
            route: BASE + '/timetables',
            video: null,
          },
        ],
      },
      {
        id: 'acad-homework',
        title: 'Homework',
        articles: [
          {
            id: 'acad-hw-create',
            q: 'How do I assign homework?',
            popular: true,
            rank: 8,
            steps: [
              'Open Academics > Homework and click Create.',
              'Select the grade, section and subject.',
              'Set the due date and write the description, or attach a file.',
              'Publish it to the class.',
            ],
            route: BASE + '/homework',
            video: null,
          },
          {
            id: 'acad-hw-edit',
            q: 'How do I edit or remove homework I already sent?',
            steps: [
              'Open Academics > Homework and find the entry.',
              'Click Edit to change the text or the due date.',
              'If it went to the wrong class, remove it and post it again correctly.',
            ],
            route: BASE + '/homework',
            video: null,
          },
          {
            id: 'acad-hw-approval',
            q: 'Why is my homework waiting for approval?',
            steps: [
              'Your school has switched on approval for Homework.',
              'It sits in the approver queue until they accept it.',
              'Track it under My Projects > Status.',
            ],
            route: BASE + '/status/homework',
            video: null,
          },
        ],
      },
      {
        id: 'acad-exam-tt',
        title: 'Exam Timetables',
        articles: [
          {
            id: 'acad-ett-create',
            q: 'How do I create an exam timetable?',
            steps: [
              'Open Academics > Exam Timetables and click Create.',
              'Enter the exam name and select the grades.',
              'Add a row for each subject with its date and session.',
              'Publish the timetable.',
            ],
            route: BASE + '/examtimetables',
            video: null,
          },
          {
            id: 'acad-ett-edit',
            q: 'An exam date changed. How do I update it?',
            steps: [
              'Open Academics > Exam Timetables and open that exam.',
              'Click Edit and change the date or session for that subject.',
              'Save, then send a message so parents notice the change.',
            ],
            route: BASE + '/examtimetables',
            video: null,
          },
        ],
      },
      {
        id: 'acad-material',
        title: 'Study Materials',
        articles: [
          {
            id: 'acad-sm-upload',
            q: 'How do I upload study material?',
            steps: [
              'Open Academics > Study Materials and click Create.',
              'Choose the subject and the folder or chapter it belongs to.',
              'Attach the PDF, image or video link.',
              'Select the audience and publish.',
            ],
            route: BASE + '/studymaterials',
            video: null,
          },
          {
            id: 'acad-sm-folders',
            q: 'How are study materials organised?',
            steps: [
              'Materials sit inside folders, usually one per subject or chapter.',
              'Open a folder to see everything filed under it.',
              'Keep the folder names consistent so students can find things quickly.',
            ],
            route: BASE + '/studymaterials/main',
            video: null,
          },
        ],
      },
      {
        id: 'acad-books',
        title: 'Books and Chapters',
        articles: [
          {
            id: 'acad-book-add',
            q: 'How do I add a book?',
            steps: [
              'Open Academics > Books and Chapters.',
              'Click Upload and enter the book name, subject and grade.',
              'Attach the book file and save.',
            ],
            route: BASE + '/books',
            video: null,
          },
          {
            id: 'acad-book-chapters',
            q: 'How do I add chapters to a book?',
            steps: [
              'Open the book from the library.',
              'Add each chapter with its name and page range.',
              'Chapters added here are what you pick from when building a question paper.',
            ],
            route: BASE + '/books',
            video: null,
          },
        ],
      },
      {
        id: 'acad-qp',
        title: 'Question Paper',
        articles: [
          {
            id: 'acad-qp-pattern',
            q: 'What is a pattern and why do I need one first?',
            steps: [
              'A pattern is the blueprint of a paper: sections, question types and marks.',
              'Open Academics > Question Paper > Patterns and create one.',
              'Once saved, any number of papers can be generated from the same pattern.',
            ],
            route: BASE + '/assessment/question-paper/patterns',
            video: null,
          },
          {
            id: 'acad-qp-create',
            q: 'How do I create a question paper?',
            popular: true,
            steps: [
              'Open Academics > Question Paper and click Create.',
              'Fill in the basic details: exam, subject, grade and total marks.',
              'Select the chapters the paper should cover.',
              'Pick the pattern, then choose questions from the question bank.',
              'Preview the paper and submit it.',
            ],
            route: BASE + '/assessment/question-paper/create',
            video: null,
          },
          {
            id: 'acad-qp-bank',
            q: 'How does the question bank work?',
            steps: [
              'Open Academics > Question Paper > Question Bank.',
              'Questions are filed by subject, chapter, type and difficulty.',
              'Add questions here once and reuse them in any paper.',
            ],
            route: BASE + '/assessment/question-paper/bank',
            video: null,
          },
          {
            id: 'acad-qp-approval',
            q: 'Who approves a question paper?',
            steps: [
              'A submitted paper goes to the question paper approval queue.',
              'The approver reviews it question by question and approves or returns it.',
              'Once approved you can download or print it.',
            ],
            route: BASE + '/assessment/question-paper/approvals',
            video: null,
          },
        ],
      },
      {
        id: 'acad-quiz',
        title: 'Online Quiz',
        articles: [
          {
            id: 'acad-quiz-create',
            q: 'How do I create an online quiz?',
            steps: [
              'Open Academics > Online Quiz and click Create.',
              'Enter the title, subject, grade and duration.',
              'Add the questions with their options and correct answers.',
              'Set the start and end time, then publish.',
            ],
            route: BASE + '/assessment/online-quiz/create',
            video: null,
          },
          {
            id: 'acad-quiz-results',
            q: 'Where do I see how students performed in a quiz?',
            steps: [
              'Open Academics > Online Quiz.',
              'Open the analysis view for that quiz.',
              'You see scores per student and which questions were most often wrong.',
            ],
            route: BASE + '/assessment/online-quiz/analysis',
            video: null,
          },
        ],
      },
      {
        id: 'acad-marks',
        title: 'Marks and Results',
        articles: [
          {
            id: 'acad-marks-enter',
            q: 'How do I enter marks?',
            popular: true,
            rank: 6,
            steps: [
              'Open Academics > Marks and click Add Marks.',
              'Select the exam, grade, section and subject.',
              'Enter the marks for each student.',
              'Save.',
            ],
            route: BASE + '/marks/addmarks',
            video: null,
          },
          {
            id: 'acad-marks-publish',
            q: 'How do I publish results to parents?',
            steps: [
              'Enter and save marks for every subject of that exam.',
              'Open the marks view for the class and check the totals.',
              'Publish the result so it appears in the parent app.',
            ],
            note: 'Publish only after all subjects are entered, otherwise parents see an incomplete result.',
            route: BASE + '/marks/view',
            video: null,
          },
          {
            id: 'acad-marks-absent',
            q: 'How do I record a student who missed the exam?',
            steps: [
              'Open the marks entry screen for that subject.',
              'Mark the student as absent instead of entering zero.',
              'Save. Absent is shown separately from a zero score in the report.',
            ],
            route: BASE + '/marks/addmarks',
            video: null,
          },
          {
            id: 'acad-marks-edit',
            q: 'Can I correct a mark after publishing?',
            steps: [
              'Open the same exam, class and subject in Add Marks.',
              'Change the value and save.',
              'Publish again so the corrected result reaches parents.',
            ],
            route: BASE + '/marks/addmarks',
            video: null,
          },
        ],
      },
      {
        id: 'acad-attendance',
        title: 'Attendance',
        articles: [
          {
            id: 'acad-att-mark',
            q: 'How do I mark daily attendance?',
            popular: true,
            rank: 2,
            steps: [
              'Open Academics > Attendance and click Add Attendance.',
              'Select the date, grade and section.',
              'Mark each student as present or absent.',
              'Click Submit.',
            ],
            note: 'If attendance was already marked for that day, the screen loads the earlier values so you only change what is different.',
            route: BASE + '/attendance/addattendance',
            video: null,
          },
          {
            id: 'acad-att-fix',
            q: 'I marked attendance wrongly. Can I correct it?',
            steps: [
              'Open Attendance and select the same date, grade and section.',
              'Change the entries that are wrong.',
              'Submit again to overwrite the earlier record.',
            ],
            note: 'Editing older dates may need admin permission depending on your school settings.',
            route: BASE + '/attendance/addattendance',
            video: null,
          },
          {
            id: 'acad-att-irregular',
            q: 'How do I find students with poor attendance?',
            steps: [
              'Open Attendance > Irregular Attendees.',
              'Choose the date range and the grade or section.',
              'Review the list and export it to follow up with parents.',
            ],
            route: BASE + '/attendance/irregular',
            video: null,
          },
          {
            id: 'acad-att-export',
            q: 'How do I export an attendance report?',
            steps: [
              'Open Attendance > Export.',
              'Choose the month or date range and the classes.',
              'Download the Excel file.',
            ],
            route: BASE + '/attendance/export',
            video: null,
          },
          {
            id: 'acad-att-holiday',
            q: 'Do I need to mark attendance on a holiday?',
            steps: [
              'No. Mark the day as a holiday in the School Calendar instead.',
              'Holidays are left out of the working day count.',
              'This keeps attendance percentages correct.',
            ],
            route: BASE + '/schoolcalendar',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'students-staff',
    title: 'Students and Staff',
    caption: 'Admissions, student records, promotion, TC and staff profiles',
    icon: GroupsOutlinedIcon,
    color: '#8600BB',
    bg: '#F7F0FF',
    mainMenus: ['profilemanagement'],
    topics: [
      {
        id: 'stu-management',
        title: 'Student Management',
        articles: [
          {
            id: 'stu-add',
            q: 'How do I add a new student?',
            popular: true,
            rank: 7,
            steps: [
              'Open Profile Management > Student and go to Student Information.',
              'Click Create and fill in the student, parent and academic details.',
              'Save. The admission number is generated or entered as per your school setting.',
            ],
            route: BASE + '/profile/student/information',
            video: null,
          },
          {
            id: 'stu-search',
            q: 'How do I find a student quickly?',
            steps: [
              'Open the student list.',
              'Type the admission number, student name or parent mobile number in the search box.',
              'Click the row to open the full profile.',
            ],
            route: BASE + '/profile/student',
            video: null,
          },
          {
            id: 'stu-edit',
            q: 'How do I correct a student record?',
            steps: [
              'Open the student from Profile Management > Student.',
              'Click Edit and change the details.',
              'Save. Parent app details update straight away.',
            ],
            route: BASE + '/profile/student/information',
            video: null,
          },
          {
            id: 'stu-sibling',
            q: 'Two siblings have separate parent logins. How do I merge them?',
            steps: [
              'Open Profile Management > Student > Merge Siblings.',
              'Search for the students and confirm they share the same parent.',
              'Merge them so the parent sees both children under one login.',
            ],
            route: BASE + '/profile/student/information/merge-sibling',
            video: null,
          },
        ],
      },
      {
        id: 'staff-management',
        title: 'Staff Management',
        articles: [
          {
            id: 'staff-add',
            q: 'How do I add a staff member?',
            steps: [
              'Open Profile Management > Staff and click Create.',
              'Fill in the personal, contact and employment details.',
              'Assign the role that decides what they can access.',
              'Save.',
            ],
            route: BASE + '/profile/staff/create',
            video: null,
          },
          {
            id: 'staff-class-teacher',
            q: 'How do I assign a class teacher?',
            steps: [
              'Open the staff member from Profile Management > Staff.',
              'Go to the class assignment section.',
              'Select the grade and section and Save.',
            ],
            route: BASE + '/profile/staff',
            video: null,
          },
          {
            id: 'staff-leaving',
            q: 'A staff member has left. What do I do?',
            steps: [
              'Open their profile and mark them inactive rather than deleting them.',
              'Reassign their classes and any pending approvals to someone else.',
              'Their past records stay intact for audit.',
            ],
            route: BASE + '/profile/staff',
            video: null,
          },
        ],
      },
      {
        id: 'stu-promotion',
        title: 'Promotion and TC',
        articles: [
          {
            id: 'stu-promote',
            q: 'How do I promote students to the next class?',
            popular: true,
            steps: [
              'Open Access Control > Student Promotion.',
              'Select the current grade and section, and the target grade and section.',
              'Review the student list and remove anyone who should not be promoted.',
              'Confirm to promote the selected students.',
            ],
            note: 'Do this only after the final results are published, and check the academic year first.',
            route: BASE + '/access/student-promotion',
            video: null,
          },
          {
            id: 'stu-tc',
            q: 'How do I issue a transfer certificate?',
            steps: [
              'Open Access Control > Issue TC.',
              'Search for the student and open the record.',
              'Enter the reason and the date of leaving.',
              'Generate the certificate and download or print it.',
            ],
            route: BASE + '/access/issue-tc',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'fees',
    title: 'Fees and Finance',
    caption: 'Fee structure, billing, concessions, expenses and reports',
    icon: PaymentsOutlinedIcon,
    color: '#FF6B35',
    bg: '#FFF5F2',
    mainMenus: ['feeandfinance'],
    topics: [
      {
        id: 'fee-structure',
        title: 'Fee Structure',
        articles: [
          {
            id: 'fee-school',
            q: 'How do I create the school fee structure?',
            popular: true,
            steps: [
              'Open Fee and Finance > Create Fee Structure and choose School Fee.',
              'Add the fee heads and the term wise amounts with due dates.',
              'Map the structure to the grades it applies to.',
              'Save.',
            ],
            route: BASE + '/fee/school',
            video: null,
          },
          {
            id: 'fee-transport-structure',
            q: 'How do I set up transport fees?',
            steps: [
              'Open Fee and Finance > Create Fee Structure and choose Transport Fee.',
              'Set the amount against each route or stop.',
              'Save. Students mapped to a stop pick up that amount automatically.',
            ],
            route: BASE + '/fee/transport',
            video: null,
          },
          {
            id: 'fee-eca-structure',
            q: 'How do I set up extra curricular activity fees?',
            steps: [
              'Open Fee and Finance > Create Fee Structure and choose Extra Curricular Fee.',
              'Create one entry per activity with its amount.',
              'Save, then add students under ECA Students.',
            ],
            route: BASE + '/fee/extra-curricular',
            video: null,
          },
          {
            id: 'fee-additional-structure',
            q: 'What is an Additional Fee used for?',
            steps: [
              'Use it for one off charges such as a trip, a uniform or an exam fee.',
              'Open Fee and Finance > Create Fee Structure and choose Additional Fee.',
              'Create the fee, then map only the students it applies to.',
            ],
            route: BASE + '/fee/extra',
            video: null,
          },
        ],
      },
      {
        id: 'fee-billing',
        title: 'Billing and Receipts',
        articles: [
          {
            id: 'fee-collect',
            q: 'How do I collect a payment and print the receipt?',
            popular: true,
            rank: 3,
            steps: [
              'Open Fee and Finance > Billing Screen.',
              'Search for the student by admission number or name.',
              'Select the terms or fee heads being paid.',
              'Choose the payment mode and click Collect.',
              'Print or download the receipt.',
            ],
            route: BASE + '/fee/pay-fees',
            video: null,
          },
          {
            id: 'fee-partial',
            q: 'Can a parent pay only part of the fee?',
            steps: [
              'On the Billing Screen, edit the amount against the fee head.',
              'Collect the part payment and issue the receipt.',
              'The balance stays outstanding and shows in the pending report.',
            ],
            route: BASE + '/fee/pay-fees',
            video: null,
          },
          {
            id: 'fee-cancel',
            q: 'I collected a wrong payment. Can I cancel the receipt?',
            steps: [
              'Open Fee and Finance > Transaction History.',
              'Find the receipt and open it.',
              'Click Cancel and enter the reason.',
            ],
            note: 'A cancelled receipt is never deleted. It stays in the history for audit.',
            route: BASE + '/fee/transaction-history',
            video: null,
          },
          {
            id: 'fee-history',
            q: 'How do I see all payments collected today?',
            steps: [
              'Open Fee and Finance > Transaction History.',
              'Filter by the date and, if needed, by the staff member who collected.',
              'Export the list for your day end reconciliation.',
            ],
            route: BASE + '/fee/transaction-history',
            video: null,
          },
          {
            id: 'fee-online-approval',
            q: 'How are online and cheque payments verified?',
            steps: [
              'They arrive in the Payment Approval queue instead of posting straight away.',
              'Open Approvals > Payments and check the reference against your bank.',
              'Approve it, and the receipt is issued to the student.',
            ],
            route: BASE + '/approvals/payments',
            video: null,
          },
        ],
      },
      {
        id: 'fee-mapping',
        title: 'Fee Student Mapping',
        articles: [
          {
            id: 'fee-eca-students',
            q: 'How do I add students to an activity fee?',
            steps: [
              'Open Fee and Finance > Fee Student Mapping > ECA Students.',
              'Select the activity and search for the students.',
              'Add them. The fee applies from the next bill.',
            ],
            route: BASE + '/fee/eca-manage',
            video: null,
          },
          {
            id: 'fee-additional-students',
            q: 'How do I map students to an additional fee?',
            steps: [
              'Open Fee and Finance > Fee Student Mapping > Additional Fee Students.',
              'Select the fee and pick the grades, sections or individual students.',
              'Save.',
            ],
            route: BASE + '/fee/additional-manage',
            video: null,
          },
          {
            id: 'fee-transport-students',
            q: 'How does a student get charged transport fee?',
            steps: [
              'Map the student to a route and stop under Transport > Student Mapping.',
              'The transport fee set for that stop is picked up automatically.',
              'Removing the mapping stops the charge from the next bill.',
            ],
            route: BASE + '/transport/student-map',
            video: null,
          },
        ],
      },
      {
        id: 'fee-concession',
        title: 'Concessions',
        articles: [
          {
            id: 'fee-concession-give',
            q: 'How do I give a concession to a student?',
            steps: [
              'Open the concession screen under Fee and Finance.',
              'Create the concession as a fixed amount or a percentage.',
              'Assign it to the student or the group of students.',
              'The reduced amount appears the next time the bill is generated.',
            ],
            route: BASE + '/fee/concession-log',
            video: null,
          },
          {
            id: 'fee-concession-log',
            q: 'Where do I see every concession given?',
            steps: [
              'Open Fee and Finance > Concession Log.',
              'Filter by grade, student or date.',
              'Each entry records the amount and who approved it.',
            ],
            route: BASE + '/fee/concession-log',
            video: null,
          },
        ],
      },
      {
        id: 'fee-expense',
        title: 'Expense and Budget',
        articles: [
          {
            id: 'fee-expense-add',
            q: 'How do I record a school expense?',
            steps: [
              'Open Fee and Finance > Expense > Add Expense.',
              'Choose the category, enter the amount and attach the bill.',
              'Save. It counts against that category budget.',
            ],
            route: BASE + '/fee/expense',
            video: null,
          },
          {
            id: 'fee-budget',
            q: 'How do I set a budget for a category?',
            steps: [
              'Open Fee and Finance > Expense > Add Budget.',
              'Choose the category and enter the allocation for the year.',
              'Save. Spending is then tracked against it.',
            ],
            route: BASE + '/fee/expense',
            video: null,
          },
        ],
      },
      {
        id: 'fee-reports',
        title: 'Reports and Dashboard',
        articles: [
          {
            id: 'fee-dashboard',
            q: 'What does the Finance Dashboard show?',
            steps: [
              'Open Fee and Finance > Finance Dashboard.',
              'It shows collections, outstanding fees and grade wise progress.',
              'Use the time range filter to switch between week, month and year.',
            ],
            route: BASE + '/fee/dashboard',
            video: null,
          },
          {
            id: 'fee-pending',
            q: 'How do I see who has not paid the fees?',
            popular: true,
            steps: [
              'Open the Finance Dashboard or the pending fee report.',
              'Filter by grade, section or term.',
              'Export the list to Excel to follow up.',
            ],
            route: BASE + '/fee/dashboard',
            video: null,
          },
          {
            id: 'fee-teams',
            q: 'What are Finance Teams?',
            steps: [
              'They split admin staff between those who collect fees and those who approve.',
              'Open Fee and Finance > Finance Teams to set who sits where.',
              'This decides whose payments need a second pair of eyes.',
            ],
            route: BASE + '/fee/teams',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'leave-payroll',
    title: 'Leave and Payroll',
    caption: 'Staff attendance, leave policy, salary structure and payroll runs',
    icon: BadgeOutlinedIcon,
    color: '#0F766E',
    bg: '#ECFDF5',
    topics: [
      {
        id: 'lp-attendance',
        title: 'Leave and Attendance',
        articles: [
          {
            id: 'lp-staff-attendance',
            q: 'How is staff attendance recorded?',
            steps: [
              'Open Leave and Payroll > Leave and Attendance.',
              'Select the month to see each staff member day by day.',
              'Attendance comes from the biometric device where one is mapped, otherwise it is marked here.',
            ],
            route: BASE + '/Leave/leave-attendance',
            video: null,
          },
          {
            id: 'lp-biometric',
            q: 'How do I connect a staff member to the biometric device?',
            steps: [
              'Open Leave and Attendance > Biometric Mapping.',
              'Find the staff member and enter their device ID.',
              'Save. Punches from that ID now land on their attendance.',
            ],
            route: BASE + '/Leave/leave-attendance/biometric-mapping',
            video: null,
          },
          {
            id: 'lp-coverage',
            q: 'What is Staff Coverage?',
            steps: [
              'It decides who counts as an employee for payroll and attendance.',
              'Open Leave and Payroll > Coverage and tick the staff to include.',
              'Anyone left out is skipped by payroll, the salary register and bank reports.',
            ],
            route: BASE + '/Leave/coverage',
            video: null,
          },
        ],
      },
      {
        id: 'lp-policy',
        title: 'Leave Policy',
        articles: [
          {
            id: 'lp-policy-setup',
            q: 'How do I set up the leave policy?',
            steps: [
              'Open Leave and Payroll > Payroll > Leave Policy.',
              'Define each leave type and how many days are allowed in a year.',
              'Save. Balances are then tracked per staff member.',
            ],
            route: BASE + '/Leave/payroll/leave-policy',
            video: null,
          },
          {
            id: 'lp-approve-leave',
            q: 'Where do I approve a leave request?',
            steps: [
              'Leave requests appear under Approvals.',
              'Open Approvals > On Leave for staff, or Student Leave for students.',
              'Approve or reject with a reason.',
            ],
            route: BASE + '/approvals/on-leave',
            video: null,
          },
        ],
      },
      {
        id: 'lp-payroll',
        title: 'Payroll',
        articles: [
          {
            id: 'lp-salary-structure',
            q: 'How do I create a salary structure?',
            steps: [
              'Open Leave and Payroll > Payroll > Salary Structures.',
              'Create a structure with its earnings and deductions.',
              'Assign it to the staff members it applies to.',
            ],
            route: BASE + '/Leave/payroll/salary-structures',
            video: null,
          },
          {
            id: 'lp-run',
            q: 'How do I run payroll for a month?',
            steps: [
              'Open Leave and Payroll > Payroll.',
              'Select the month. Attendance and leave are pulled in automatically.',
              'Review each staff member and generate the payroll.',
              'Send it for approval.',
            ],
            route: BASE + '/Leave/payroll',
            video: null,
          },
          {
            id: 'lp-approve',
            q: 'Who approves the payroll?',
            steps: [
              'Open Leave and Payroll > Payroll > Approve Payroll.',
              'The approver checks the totals and approves the run.',
              'Only then can the bank report be generated.',
            ],
            route: BASE + '/Leave/payroll/approve-payroll',
            video: null,
          },
          {
            id: 'lp-bank',
            q: 'How do I get the bank transfer file and the salary register?',
            steps: [
              'After approval, open Payroll > Bank Reports for the transfer file.',
              'Open Payroll > Salary Register for the month wise register.',
              'Once the bank confirms, mark the salary as credited.',
            ],
            route: BASE + '/Leave/payroll/bank-reports',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'transport',
    title: 'Transport and Assets',
    caption: 'Vehicles, safety documents, routes, student mapping and inventory',
    icon: DirectionsBusOutlinedIcon,
    color: '#00ACC1',
    bg: '#E6F7FA',
    mainMenus: ['transport'],
    topics: [
      {
        id: 'tr-vehicles',
        title: 'Vehicles',
        articles: [
          {
            id: 'tr-vehicle-add',
            q: 'How do I add a vehicle?',
            popular: true,
            steps: [
              'Open Transport > Vehicle Details and click Add.',
              'Enter the registration number, seating capacity and driver details.',
              'Save the vehicle.',
            ],
            route: BASE + '/transport/details/add',
            video: null,
          },
          {
            id: 'tr-safety',
            q: 'How do I record insurance, FC and permit details?',
            steps: [
              'Open the vehicle from Transport > Vehicle Details.',
              'Go to the safety and compliance section.',
              'Enter each document number with its expiry date and save.',
            ],
            route: BASE + '/transport/details',
            video: null,
          },
          {
            id: 'tr-expiry',
            q: 'Where do I see documents that are about to expire?',
            steps: [
              'Open Transport > Vehicle Details.',
              'Documents nearing expiry are highlighted in the list.',
              'Open the vehicle and update the new dates once renewed.',
            ],
            route: BASE + '/transport/details',
            video: null,
          },
        ],
      },
      {
        id: 'tr-routes',
        title: 'Routes',
        articles: [
          {
            id: 'tr-route-create',
            q: 'How do I create a route?',
            steps: [
              'Open Transport > Route and click Create.',
              'Name the route and add the stops in travel order.',
              'Assign the vehicle that runs it and Save.',
            ],
            route: BASE + '/transport/route',
            video: null,
          },
          {
            id: 'tr-route-change',
            q: 'How do I change the vehicle on a route?',
            steps: [
              'Open Transport > Route and open that route.',
              'Change the assigned vehicle and save.',
              'Students mapped to the route move with it automatically.',
            ],
            route: BASE + '/transport/route',
            video: null,
          },
        ],
      },
      {
        id: 'tr-mapping',
        title: 'Student Mapping',
        articles: [
          {
            id: 'tr-map-students',
            q: 'How do I map students to a route?',
            popular: true,
            rank: 12,
            steps: [
              'Open Transport > Student Mapping.',
              'Select the route and the stop.',
              'Search for the students and add them to that stop.',
              'Save the mapping.',
            ],
            note: 'The transport fee comes from the stop the student is mapped to.',
            route: BASE + '/transport/student-map',
            video: null,
          },
          {
            id: 'tr-map-remove',
            q: 'A student stopped using the bus. What do I do?',
            steps: [
              'Open Transport > Student Mapping and find the student.',
              'Remove them from the stop.',
              'The transport fee stops from the next bill onward.',
            ],
            route: BASE + '/transport/student-map',
            video: null,
          },
        ],
      },
      {
        id: 'tr-inventory',
        title: 'Inventory',
        articles: [
          {
            id: 'tr-inv-add',
            q: 'How do I track school assets and stock?',
            steps: [
              'Open Inventory from the sidebar.',
              'Add each item with its quantity, category and location.',
              'Update the quantity as stock moves in and out.',
            ],
            route: BASE + '/inventory',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'approvals',
    title: 'Approvals',
    caption: 'How items get approved, and where each queue lives',
    icon: TaskAltOutlinedIcon,
    color: '#7DC353',
    bg: '#F1F9EC',
    mainMenus: ['approvals'],
    topics: [
      {
        id: 'apr-how',
        title: 'How Approvals Work',
        articles: [
          {
            id: 'apr-what',
            q: 'How does the approval flow work?',
            popular: true,
            rank: 9,
            steps: [
              'When approval is on for a module, anything created goes to the approver instead of publishing straight away.',
              'The approver opens Approvals and sees it in the pending list.',
              'They can approve it, edit and then approve it, or reject it with a reason.',
              'The person who created it is notified either way.',
            ],
            route: BASE + '/approvals',
            video: null,
          },
          {
            id: 'apr-edit-approve',
            q: 'Can I fix a small mistake instead of rejecting?',
            steps: [
              'Open the item in the approval queue.',
              'Use the edit option to correct the text or the audience.',
              'Approve it. The corrected version is what goes out.',
            ],
            route: BASE + '/approvals',
            video: null,
          },
          {
            id: 'apr-my-status',
            q: 'How do I check if my own post was approved?',
            steps: [
              'Open My Projects > Status.',
              'Pick the type of post you sent.',
              'Each item shows pending, approved or rejected with the reason.',
            ],
            route: BASE + '/status',
            video: null,
          },
        ],
      },
      {
        id: 'apr-queues',
        title: 'The Queues',
        articles: [
          {
            id: 'apr-comm',
            q: 'Where are news, message and circular approvals?',
            steps: [
              'Open Approvals and choose News, Messages, Circulars or Homework.',
              'Each queue lists what is waiting with who sent it and when.',
            ],
            route: BASE + '/approvals/news',
            video: null,
          },
          {
            id: 'apr-fee',
            q: 'Where are fee approvals?',
            steps: [
              'Open Approvals and choose School, Transport, ECA or Additional for fee structures.',
              'Choose Payments to verify online and cheque collections.',
            ],
            route: BASE + '/approvals/payments',
            video: null,
          },
          {
            id: 'apr-leave-qp',
            q: 'Where are leave and question paper approvals?',
            steps: [
              'Open Approvals > Student Leave for student leave requests.',
              'Open Approvals > On Leave for staff leave.',
              'Open Approvals > Question Paper for papers waiting on review.',
            ],
            route: BASE + '/approvals/student-leave',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'access-control',
    title: 'Access Control',
    caption: 'Users, roles, permissions, academic year and class setup',
    icon: AdminPanelSettingsOutlinedIcon,
    color: '#6D28D9',
    bg: '#F5F3FF',
    mainMenus: ['accesscontrol'],
    topics: [
      {
        id: 'ac-users',
        title: 'Users',
        articles: [
          {
            id: 'ac-user-create',
            q: 'How do I create a user login?',
            steps: [
              'Open Access Control > Users.',
              'Add the user and link them to the staff or student record.',
              'Assign a role and save.',
            ],
            route: BASE + '/access/users',
            video: null,
          },
          {
            id: 'ac-password',
            q: 'How do I reset a user password?',
            steps: [
              'Open Access Control > Users > Passwords.',
              'Search for the user.',
              'Click Reset and share the temporary password with them.',
            ],
            note: 'The user is asked to set a new password at the next login.',
            route: BASE + '/access/password',
            video: null,
          },
          {
            id: 'ac-activity',
            q: 'How do I see what a user did in the system?',
            steps: [
              'Open Access Control > Users > User Activity.',
              'Filter by user and date range.',
              'Review the recorded actions.',
            ],
            route: BASE + '/access/useractivity',
            video: null,
          },
        ],
      },
      {
        id: 'ac-roles',
        title: 'Roles and Permissions',
        articles: [
          {
            id: 'ac-role-create',
            q: 'How do I create a role with limited access?',
            popular: true,
            rank: 10,
            steps: [
              'Open Access Control > Roles and Permissions.',
              'Click Create Role and give it a name.',
              'Tick the modules and the actions the role should have: view, create, edit, delete.',
              'Save, then assign the role to the users who need it.',
            ],
            note: 'Users must log out and log in again before new permissions take effect.',
            route: BASE + '/access/roles-permissions',
            video: null,
          },
          {
            id: 'ac-feature',
            q: 'What are Feature Permissions?',
            steps: [
              'They control fine grained actions inside a module, beyond view and edit.',
              'Open Access Control > Feature Permissions.',
              'Switch each feature on for the roles that need it.',
            ],
            route: BASE + '/access/feature-permissions',
            video: null,
          },
          {
            id: 'ac-approval-flow',
            q: 'How do I decide who approves what?',
            steps: [
              'Open Access Control > Module Configuration > Approvals.',
              'Select the module you want to control.',
              'Choose the role or user who should approve it and save.',
            ],
            route: BASE + '/access/config/approvals',
            video: null,
          },
        ],
      },
      {
        id: 'ac-academics',
        title: 'Academics Setup',
        articles: [
          {
            id: 'ac-year',
            q: 'How do I open a new academic year?',
            steps: [
              'Open Access Control > Academics > Academic Year.',
              'Add the new year with its start and end dates.',
              'Make it active when you are ready to work in it.',
            ],
            route: BASE + '/access/academics/academic-year',
            video: null,
          },
          {
            id: 'ac-class',
            q: 'How do I add a new class or section?',
            steps: [
              'Open Access Control > Academics > Class and Section.',
              'Add the grade, then add the sections under it.',
              'Save. The new class appears everywhere grades are used.',
            ],
            route: BASE + '/access/class-section',
            video: null,
          },
          {
            id: 'ac-exam',
            q: 'How do I add an exam name?',
            steps: [
              'Open Access Control > Academics > Exams.',
              'Add the exam with its name and maximum marks.',
              'It then appears when entering marks and building exam timetables.',
            ],
            route: BASE + '/access/exam',
            video: null,
          },
          {
            id: 'ac-subject',
            q: 'How do I add a subject?',
            steps: [
              'Open Access Control > Academics > Subjects.',
              'Create the subject and map it to the grades that study it.',
              'Save. It becomes selectable in timetables, homework and marks.',
            ],
            route: BASE + '/access/subject',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'complaints',
    title: 'Complaints',
    caption: 'Raising, assigning, resolving and configuring complaints',
    icon: SupportAgentOutlinedIcon,
    color: '#F44336',
    bg: '#FFF1F0',
    topics: [
      {
        id: 'cmp-raise',
        title: 'Raising and Tracking',
        articles: [
          {
            id: 'cmp-raise-how',
            q: 'How is a complaint raised?',
            steps: [
              'Parents raise it from the mobile app.',
              'Staff can log one from Complaints > Register.',
              'Choose the category, describe the issue and submit.',
              'It gets a ticket number and a due date from the SLA for that category.',
            ],
            route: BASE + '/complaints/register',
            video: null,
          },
          {
            id: 'cmp-status',
            q: 'What do the complaint statuses mean?',
            popular: true,
            steps: [
              'Open means it has not been picked up yet.',
              'In Progress means it is assigned and being worked on.',
              'Resolved means it is closed with a resolution note.',
              'Escalated means the SLA was breached and it moved to the next level.',
            ],
            route: BASE + '/complaints/manage',
            video: null,
          },
          {
            id: 'cmp-internal',
            q: 'What is an internal issue?',
            steps: [
              'It is a complaint raised by staff about something inside the school.',
              'Log it from Complaints > Add Issue.',
              'It follows its own categories, SLA and assignment rules.',
            ],
            route: BASE + '/complaints/add-issue',
            video: null,
          },
        ],
      },
      {
        id: 'cmp-work',
        title: 'Working on Complaints',
        articles: [
          {
            id: 'cmp-mine',
            q: 'Where do I see the complaints assigned to me?',
            steps: [
              'Open Complaints > My Work.',
              'Open a ticket to see the history and the due date.',
              'Add your update and change the status when it is done.',
            ],
            route: BASE + '/complaints/my-work',
            video: null,
          },
          {
            id: 'cmp-resolve',
            q: 'How do I close a complaint properly?',
            steps: [
              'Open the ticket and add what was actually done.',
              'Set the status to Resolved.',
              'The parent or staff member sees the resolution note on their side.',
            ],
            route: BASE + '/complaints/my-work',
            video: null,
          },
          {
            id: 'cmp-overdue',
            q: 'What happens if a complaint goes past its due date?',
            steps: [
              'It is marked as breached and escalated by the rules you set.',
              'The next level owner is notified.',
              'Overdue tickets are highlighted in the complaints dashboard.',
            ],
            route: BASE + '/complaints/manage',
            video: null,
          },
        ],
      },
      {
        id: 'cmp-config',
        title: 'Configuration',
        articles: [
          {
            id: 'cmp-categories',
            q: 'How do I add or change complaint categories?',
            steps: [
              'Open Complaints > Configuration > Categories.',
              'Add the category and, if needed, its sub categories.',
              'Save. It is then selectable when raising a complaint.',
            ],
            route: BASE + '/complaints/configuration/categories',
            video: null,
          },
          {
            id: 'cmp-sla',
            q: 'How do I set the SLA for a category?',
            steps: [
              'Open Complaints > Configuration > SLA.',
              'Set the response time and the resolution time for each category.',
              'Save. Due dates are calculated from these.',
            ],
            route: BASE + '/complaints/configuration/sla',
            video: null,
          },
          {
            id: 'cmp-assignment',
            q: 'How do I decide who receives which complaint?',
            steps: [
              'Open Complaints > Configuration > Assignment Mapping.',
              'Map each category to the staff member or role who owns it.',
              'New complaints in that category go straight to them.',
            ],
            route: BASE + '/complaints/configuration/assignment-mapping',
            video: null,
          },
          {
            id: 'cmp-escalation',
            q: 'How do I set up escalation?',
            steps: [
              'Open Complaints > Configuration > Escalation.',
              'Choose who gets the ticket at each level when the SLA is breached.',
              'Save. Escalation then runs on its own.',
            ],
            route: BASE + '/complaints/configuration/escalation',
            video: null,
          },
          {
            id: 'cmp-audit',
            q: 'Can I see the full history of a complaint?',
            steps: [
              'Open Complaints > Configuration > Audit Log.',
              'Search for the ticket.',
              'Every status change, assignment and edit is listed with who did it.',
            ],
            route: BASE + '/complaints/configuration/audit-log',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'my-projects',
    title: 'My Projects',
    caption: 'Your scheduled posts and the approval status of what you sent',
    icon: FolderSpecialOutlinedIcon,
    color: '#B45309',
    bg: '#FFFBEB',
    mainMenus: ['myprojects'],
    topics: [
      {
        id: 'mp-schedule',
        title: 'Schedule',
        articles: [
          {
            id: 'mp-sched-view',
            q: 'Where do I see posts I scheduled for later?',
            steps: [
              'Open My Projects > Schedule.',
              'Every post waiting for its publish time is listed there.',
              'Open one to change the time or cancel it before it goes out.',
            ],
            route: BASE + '/schedule',
            video: null,
          },
        ],
      },
      {
        id: 'mp-status',
        title: 'Status',
        articles: [
          {
            id: 'mp-status-view',
            q: 'How do I track what I sent for approval?',
            steps: [
              'Open My Projects > Status.',
              'Choose the type: news, messages, circulars, homework or a fee structure.',
              'Each row shows pending, approved or rejected with the reason.',
            ],
            route: BASE + '/status',
            video: null,
          },
          {
            id: 'mp-status-rejected',
            q: 'My post was rejected. What now?',
            steps: [
              'Open My Projects > Status and read the rejection reason.',
              'Create the post again with the correction.',
              'Send it for approval once more.',
            ],
            route: BASE + '/status',
            video: null,
          },
        ],
      },
    ],
  },

  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    caption: 'Common problems and what to try before contacting support',
    icon: BuildOutlinedIcon,
    color: '#6B7280',
    bg: '#F3F4F6',
    topics: [
      {
        id: 'ts-common',
        title: 'Common Problems',
        articles: [
          {
            id: 'ts-blank',
            q: 'The page is blank or the data is not loading',
            steps: [
              'Refresh the page once.',
              'Check that the academic year and the class filters at the top are correct.',
              'Log out and log in again, as your session may have expired.',
              'If it still fails, contact support with the screen name and the time it happened.',
            ],
            video: null,
          },
          {
            id: 'ts-download',
            q: 'My Excel or PDF download is not working',
            steps: [
              'Allow pop ups and downloads for this site in your browser.',
              'Try the export again.',
              'If nothing downloads, try Chrome.',
            ],
            video: null,
          },
          {
            id: 'ts-logout',
            q: 'I keep getting logged out',
            steps: [
              'Sessions expire after a period of inactivity.',
              'Logging in on another device signs you out of the earlier one.',
              'If it keeps happening, ask your admin whether your account is being shared.',
            ],
            video: null,
          },
          {
            id: 'ts-missing-student',
            q: 'A student or a class is missing from a list',
            steps: [
              'Check the academic year selected in the top bar.',
              'Check the grade and section filters on the screen.',
              'Confirm the student is active and not transferred out.',
              'If the class itself is missing, add it under Access Control > Class and Section.',
            ],
            video: null,
          },
          {
            id: 'ts-permission',
            q: 'I get sent back to the dashboard when I open a screen',
            steps: [
              'That screen is not enabled for your role.',
              'Ask your admin to switch it on under Roles and Permissions.',
              'Log out and log in again afterwards.',
            ],
            video: null,
          },
          {
            id: 'ts-slow',
            q: 'The system feels slow',
            steps: [
              'Narrow the filters instead of loading a whole year at once.',
              'Close unused browser tabs.',
              'Check your internet connection before reporting it.',
            ],
            video: null,
          },
        ],
      },
    ],
  },
];

export const ROUTE_CATEGORY_MAP = [
  { match: ['/complaints'], category: 'complaints' },
  { match: ['/Leave'], category: 'leave-payroll' },
  { match: ['/approvals'], category: 'approvals' },
  { match: ['/access'], category: 'access-control' },
  { match: ['/schedule', '/status', '/myprojects'], category: 'my-projects' },
  { match: ['/fee'], category: 'fees' },
  { match: ['/transport', '/asset', '/inventory'], category: 'transport' },
  { match: ['/profile'], category: 'students-staff' },
  {
    match: ['/timetables', '/homework', '/examtimetables', '/studymaterials', '/marks', '/attendance', '/books', '/assessment'],
    category: 'academics',
  },
  {
    match: ['/news', '/messages', '/circulars', '/consentforms', '/feedback', '/com-dashboard', '/contact', '/birthday-post', '/notification', '/chats', '/schoolcalendar'],
    category: 'communication',
  },
];

export const getCategoryIdForPath = (pathname) => {
  const path = String(pathname || '');
  const hit = ROUTE_CATEGORY_MAP.find((entry) => entry.match.some((m) => path.includes(m)));
  return hit ? hit.category : null;
};

export const countArticles = (category) =>
  (category.topics || []).reduce((total, topic) => total + topic.articles.length, 0);

export const isCategoryAllowed = (category, hasAccess) => {
  if (!category.mainMenus || !category.mainMenus.length) return true;
  return category.mainMenus.some((menu) => hasAccess(menu));
};

export const getVisibleCategories = (hasAccess) =>
  HELP_CATEGORIES.filter((category) => isCategoryAllowed(category, hasAccess));

const eachArticle = (categories, visit) => {
  categories.forEach((category) => {
    (category.topics || []).forEach((topic) => {
      topic.articles.forEach((article) => visit(article, topic, category));
    });
  });
};

export const searchArticles = (categories, query) => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const results = [];
  eachArticle(categories, (article, topic, category) => {
    const haystack = [article.q, topic.title, ...(article.steps || []), article.note || '']
      .join(' ')
      .toLowerCase();
    if (haystack.includes(q)) results.push({ ...article, topic, category });
  });
  return results;
};

export const getPopularArticles = (categories, limit = 6) => {
  const results = [];
  eachArticle(categories, (article, topic, category) => {
    if (article.popular) results.push({ ...article, topic, category });
  });
  results.sort((a, b) => (a.rank || 99) - (b.rank || 99));
  return results.slice(0, limit);
};
