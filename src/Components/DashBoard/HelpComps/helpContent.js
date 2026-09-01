import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
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
    caption: 'Login, profile and the basics of moving around SchoolMate',
    icon: RocketLaunchOutlinedIcon,
    color: '#EEA200',
    bg: '#FFF7E5',
    articles: [
      {
        id: 'gs-login',
        q: 'How do I log in to SchoolMate?',
        popular: true,
        steps: [
          'Open the SchoolMate web address shared by your school.',
          'Enter your registered mobile number or username and your password.',
          'Click Login. You will land on the dashboard for your role.',
        ],
        note: 'Repeated wrong passwords temporarily lock the account. Wait a few minutes or ask your admin to reset it.',
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
        note: 'An admin can also reset it from Access Control > Password Management.',
        route: BASE + '/access/password',
        video: null,
      },
      {
        id: 'gs-missing-menu',
        q: 'Why can I not see some menus in the sidebar?',
        popular: true,
        steps: [
          'SchoolMate shows only the modules your role is allowed to use.',
          'Ask your admin to open Access Control > Roles and Permissions.',
          'The module and the action (view, create, edit, delete) must be enabled for your role.',
          'Log out and log in again for the new permissions to take effect.',
        ],
        video: null,
      },
      {
        id: 'gs-academic-year',
        q: 'How do I switch the academic year?',
        steps: [
          'Use the academic year selector in the top bar.',
          'Pick the year you want to work in.',
          'Lists, marks, attendance and fees reload for the selected year.',
        ],
        note: 'Creating new records is normally allowed only in the active academic year.',
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
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    caption: 'News, messages, circulars, consent forms and feedback',
    icon: CampaignOutlinedIcon,
    color: '#E30053',
    bg: '#FFF1F5',
    mainMenus: ['communication'],
    articles: [
      {
        id: 'comm-news',
        q: 'How do I post news?',
        popular: true,
        steps: [
          'Open Communication > News from the sidebar.',
          'Click Create News at the top right.',
          'Enter the title and description, and upload an image if needed.',
          'Choose the audience: everyone, selected grades, or specific sections.',
          'Click Publish.',
        ],
        note: 'If approval is switched on for News, the post goes to the approver before parents can see it.',
        route: BASE + '/news',
        video: null,
      },
      {
        id: 'comm-difference',
        q: 'What is the difference between News, Circular and Message?',
        popular: true,
        steps: [
          'News is a general school update meant for a wide audience.',
          'Circular is an official notice, usually with an attachment and an acknowledgement from parents.',
          'Message is a targeted note to a class, a section, or individual students and parents.',
        ],
        video: null,
      },
      {
        id: 'comm-message',
        q: 'How do I send a message to one class only?',
        steps: [
          'Open Communication > Messages.',
          'Click Create Message.',
          'Select the grade and section, or pick individual students.',
          'Type the message, attach a file if needed, and Send.',
        ],
        route: BASE + '/messages',
        video: null,
      },
      {
        id: 'comm-circular',
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
        id: 'comm-not-visible',
        q: 'My post is not visible to parents. Why?',
        popular: true,
        steps: [
          'Check whether the post is still waiting for approval under Approvals.',
          'Confirm the audience you selected actually includes those parents.',
          'Check the scheduled publish date and time on the post.',
          'Make sure the post was published and not left as a draft.',
        ],
        route: BASE + '/approvals',
        video: null,
      },
      {
        id: 'comm-read-tracking',
        q: 'How do I know who has read my post?',
        steps: [
          'Open the published news, message or circular from its list.',
          'Click View Tracking on the post.',
          'You will see the read and unread list by student and parent.',
        ],
        video: null,
      },
      {
        id: 'comm-consent',
        q: 'How do I create a consent form and see the responses?',
        steps: [
          'Open Communication > Consent Forms and click Create.',
          'Add the questions with their answer options and set the last date.',
          'Select the audience and publish the form.',
          'Open the form later and switch to the Responses tab to see who replied.',
        ],
        note: 'Responses can be exported to Excel from the Responses tab.',
        route: BASE + '/consentforms',
        video: null,
      },
      {
        id: 'comm-feedback',
        q: 'How do I collect feedback from parents?',
        steps: [
          'Open Communication > Feedback and click Create.',
          'Add your questions and choose the answer type.',
          'Select the audience and publish.',
          'Use the Responses screen to review and export the answers.',
        ],
        route: BASE + '/feedback',
        video: null,
      },
      {
        id: 'comm-schedule',
        q: 'Can I schedule a post for a later date?',
        steps: [
          'While creating the post, set the publish date and time.',
          'Save and publish it as usual.',
          'The post stays in Scheduled status and goes out automatically at that time.',
        ],
        video: null,
      },
    ],
  },
  {
    id: 'academics',
    title: 'Academics',
    caption: 'Timetables, homework, attendance, marks and study material',
    icon: MenuBookOutlinedIcon,
    color: '#3457D5',
    bg: '#EEF2FF',
    mainMenus: ['communication'],
    articles: [
      {
        id: 'acad-timetable',
        q: 'How do I create a class timetable?',
        popular: true,
        steps: [
          'Open Time Tables from the sidebar and click Create.',
          'Select the grade and section.',
          'Click a period cell and choose the subject and the teacher.',
          'Repeat for every period and Save.',
        ],
        note: 'If the same teacher is already booked for that period in another class, SchoolMate warns you before saving.',
        route: BASE + '/timetables',
        video: null,
      },
      {
        id: 'acad-homework',
        q: 'How do I assign homework?',
        popular: true,
        steps: [
          'Open Homework and click Create.',
          'Select the grade, section and subject.',
          'Set the due date and write the description, or attach a file.',
          'Publish it to the class.',
        ],
        route: BASE + '/homework',
        video: null,
      },
      {
        id: 'acad-attendance',
        q: 'How do I mark daily attendance?',
        popular: true,
        steps: [
          'Open Attendance and click Add Attendance.',
          'Select the date, grade and section.',
          'Mark each student as present or absent.',
          'Click Submit.',
        ],
        note: 'If attendance was already marked for that day, the screen loads the earlier values so you only change what is different.',
        route: BASE + '/attendance',
        video: null,
      },
      {
        id: 'acad-attendance-fix',
        q: 'I marked attendance wrongly. Can I correct it?',
        steps: [
          'Open Attendance and select the same date, grade and section.',
          'Change the entries that are wrong.',
          'Submit again to overwrite the earlier record.',
        ],
        note: 'Editing older dates may need admin permission depending on your school settings.',
        route: BASE + '/attendance',
        video: null,
      },
      {
        id: 'acad-irregular',
        q: 'How do I find students with poor attendance?',
        steps: [
          'Open Attendance and go to Irregular Attendees.',
          'Choose the date range and the grade or section.',
          'Review the list and export it if needed.',
        ],
        route: BASE + '/attendance/irregular',
        video: null,
      },
      {
        id: 'acad-marks',
        q: 'How do I enter marks and publish results?',
        popular: true,
        steps: [
          'Open Marks and Results and click Add Marks.',
          'Select the exam, grade, section and subject.',
          'Enter the marks for each student and Save.',
          'When every subject is entered, publish the result to release it to parents.',
        ],
        route: BASE + '/marks',
        video: null,
      },
      {
        id: 'acad-exam-timetable',
        q: 'How do I create an exam timetable?',
        steps: [
          'Open Exam Time Tables and click Create.',
          'Enter the exam name and select the grades.',
          'Add a row for each subject with its date and session.',
          'Publish the timetable.',
        ],
        route: BASE + '/examtimetables',
        video: null,
      },
      {
        id: 'acad-study-material',
        q: 'How do I upload study material?',
        steps: [
          'Open Study Materials and click Create.',
          'Choose the subject and the chapter or folder.',
          'Attach the PDF, image or video link.',
          'Select the audience and publish.',
        ],
        route: BASE + '/studymaterials',
        video: null,
      },
    ],
  },
  {
    id: 'students-staff',
    title: 'Students and Staff',
    caption: 'Admissions, student records, promotion and staff profiles',
    icon: GroupsOutlinedIcon,
    color: '#8600BB',
    bg: '#F7F0FF',
    mainMenus: ['profilemanagement'],
    articles: [
      {
        id: 'stu-add',
        q: 'How do I add a new student?',
        popular: true,
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
          'Click the matching row to open the full profile.',
        ],
        route: BASE + '/profile/student',
        video: null,
      },
      {
        id: 'stu-promotion',
        q: 'How do I promote students to the next class?',
        popular: true,
        steps: [
          'Open Access Control > Student Promotion.',
          'Select the current grade and section, and the target grade and section.',
          'Review the student list and remove anyone who should not be promoted.',
          'Confirm to promote the selected students.',
        ],
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
      {
        id: 'staff-add',
        q: 'How do I add a staff member?',
        steps: [
          'Open Profile Management > Staff and click Create.',
          'Fill in the personal, contact and employment details.',
          'Assign the role that decides what the staff member can access.',
          'Save.',
        ],
        route: BASE + '/profile/staff',
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
    ],
  },
  {
    id: 'fees',
    title: 'Fees and Finance',
    caption: 'Fee structure, billing, concessions and collection reports',
    icon: PaymentsOutlinedIcon,
    color: '#FF6B35',
    bg: '#FFF5F2',
    mainMenus: ['feeandfinance'],
    articles: [
      {
        id: 'fee-structure',
        q: 'How do I create a fee structure?',
        popular: true,
        steps: [
          'Open Fee and Finance and choose Create Fee Structure.',
          'Pick the fee type: School, Transport, Extra Curricular or Additional.',
          'Add the term wise amounts and due dates.',
          'Map the structure to the grades it applies to and Save.',
        ],
        route: BASE + '/fee',
        video: null,
      },
      {
        id: 'fee-collect',
        q: 'How do I collect a payment and print the receipt?',
        popular: true,
        steps: [
          'Open Fee and Finance > Billing.',
          'Search for the student by admission number or name.',
          'Select the terms or fee heads being paid.',
          'Choose the payment mode and click Collect.',
          'Print or download the receipt.',
        ],
        route: BASE + '/fee/billing',
        video: null,
      },
      {
        id: 'fee-concession',
        q: 'How do I give a concession to a student?',
        steps: [
          'Open the concession screen under Fee and Finance.',
          'Create the concession as a fixed amount or a percentage.',
          'Assign it to the student or the group of students.',
          'The reduced amount appears the next time the bill is generated.',
        ],
        note: 'Every concession is recorded in the concession log with who approved it.',
        route: BASE + '/fee/concession-log',
        video: null,
      },
      {
        id: 'fee-pending',
        q: 'How do I see who has not paid the fees?',
        popular: true,
        steps: [
          'Open the Finance Dashboard or the fee reports screen.',
          'Filter by grade, section or term.',
          'Review the pending list and export it to Excel to follow up.',
        ],
        route: BASE + '/fee/dashboard',
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
        note: 'A cancelled receipt is never deleted. It stays in the transaction history for audit.',
        route: BASE + '/fee/transaction-history',
        video: null,
      },
      {
        id: 'fee-eca',
        q: 'How do I manage extra curricular activity fees?',
        steps: [
          'Create an Extra Curricular fee structure for the activity.',
          'Open ECA Management and add the students who joined the activity.',
          'Removed students stay in the removed list with the date, for reference.',
        ],
        route: BASE + '/fee/eca-manage',
        video: null,
      },
    ],
  },
  {
    id: 'transport',
    title: 'Transport and Assets',
    caption: 'Vehicles, safety documents, routes and student mapping',
    icon: DirectionsBusOutlinedIcon,
    color: '#00ACC1',
    bg: '#E6F7FA',
    mainMenus: ['transport'],
    articles: [
      {
        id: 'tr-vehicle',
        q: 'How do I add a vehicle?',
        popular: true,
        steps: [
          'Open Transport > Vehicle Details and click Add.',
          'Enter the registration number, seating capacity and the driver details.',
          'Save the vehicle.',
          'Then add the insurance, fitness and permit dates under the safety section.',
        ],
        route: BASE + '/transport/details',
        video: null,
      },
      {
        id: 'tr-route',
        q: 'How do I create a route?',
        steps: [
          'Open Transport > Route and click Create.',
          'Name the route and add the stops in the order the vehicle travels.',
          'Assign the vehicle that runs the route and Save.',
        ],
        route: BASE + '/transport/route',
        video: null,
      },
      {
        id: 'tr-mapping',
        q: 'How do I map students to a route?',
        popular: true,
        steps: [
          'Open Transport > Student Mapping.',
          'Select the route and the stop.',
          'Search for the students and add them to that stop.',
          'Save the mapping.',
        ],
        note: 'Transport fee is calculated from the stop the student is mapped to.',
        route: BASE + '/transport/student-map',
        video: null,
      },
      {
        id: 'tr-expiry',
        q: 'Where do I see expiring insurance and fitness certificates?',
        steps: [
          'Open the vehicle safety section under Transport.',
          'Documents that expire soon are highlighted.',
          'Open the vehicle and update the new dates once renewed.',
        ],
        route: BASE + '/transport/details',
        video: null,
      },
    ],
  },
  {
    id: 'approvals-access',
    title: 'Approvals and Access Control',
    caption: 'Approval flows, roles, permissions and user management',
    icon: AdminPanelSettingsOutlinedIcon,
    color: '#7DC353',
    bg: '#F1F9EC',
    mainMenus: ['approvals', 'accesscontrol'],
    articles: [
      {
        id: 'apr-how',
        q: 'How does the approval flow work?',
        popular: true,
        steps: [
          'When approval is switched on for a module, anything created goes to the approver instead of publishing straight away.',
          'The approver opens Approvals and sees the item in the pending list.',
          'They can approve it, edit and then approve it, or reject it with a reason.',
          'The person who created it is notified either way.',
        ],
        route: BASE + '/approvals',
        video: null,
      },
      {
        id: 'apr-setup',
        q: 'How do I decide who approves what?',
        steps: [
          'Open Access Control > Approval Flows.',
          'Select the module you want to control.',
          'Choose the role or the user who should approve it.',
          'Save the flow.',
        ],
        route: BASE + '/access/config/approvals',
        video: null,
      },
      {
        id: 'acc-role',
        q: 'How do I create a role with limited access?',
        popular: true,
        steps: [
          'Open Access Control > Roles and Permissions.',
          'Click Create Role and give it a name.',
          'Tick the modules and the actions the role should have: view, create, edit, delete.',
          'Save, then assign the role to the users who need it.',
        ],
        note: 'Users must log out and log in again before the new permissions take effect.',
        route: BASE + '/access/roles-permissions',
        video: null,
      },
      {
        id: 'acc-reset',
        q: 'How do I reset a user password?',
        steps: [
          'Open Access Control > Password Management.',
          'Search for the user.',
          'Click Reset and share the temporary password with them.',
        ],
        note: 'The user is asked to set a new password at the next login.',
        route: BASE + '/access/password',
        video: null,
      },
      {
        id: 'acc-activity',
        q: 'How do I see what a user did in the system?',
        steps: [
          'Open Access Control > User Activity.',
          'Filter by user and date range.',
          'Review the recorded actions.',
        ],
        route: BASE + '/access/useractivity',
        video: null,
      },
      {
        id: 'acc-class-section',
        q: 'How do I add a new class or section?',
        steps: [
          'Open Access Control > Class and Section.',
          'Add the grade, then add the sections under it.',
          'Save. The new class appears in every module that uses grades.',
        ],
        route: BASE + '/access/class-section',
        video: null,
      },
    ],
  },
  {
    id: 'complaints',
    title: 'Complaints',
    caption: 'Raising, assigning and closing complaints within the SLA',
    icon: SupportAgentOutlinedIcon,
    color: '#F44336',
    bg: '#FFF1F0',
    articles: [
      {
        id: 'cmp-raise',
        q: 'How is a complaint raised?',
        steps: [
          'Parents raise a complaint from the mobile app.',
          'Staff can also log one from Complaints > Register.',
          'Choose the category, describe the issue and submit.',
          'The complaint gets a ticket number and a due date based on the SLA for that category.',
        ],
        route: BASE + '/complaints/register',
        video: null,
      },
      {
        id: 'cmp-status',
        q: 'What do the complaint statuses mean?',
        popular: true,
        steps: [
          'Open means the complaint has not been picked up yet.',
          'In Progress means it is assigned and being worked on.',
          'Resolved means it is closed with a resolution note.',
          'Escalated means the SLA was breached and it moved to the next level.',
        ],
        route: BASE + '/complaints/manage',
        video: null,
      },
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
        id: 'cmp-sla',
        q: 'How do I change the SLA or the category list?',
        steps: [
          'Open Complaints > Configuration.',
          'Use Categories to add or edit the complaint types.',
          'Use SLA to set the response and resolution time for each category.',
          'Use Assignment Mapping to decide who receives each category.',
        ],
        route: BASE + '/complaints/configuration',
        video: null,
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
          'If nothing downloads, try a different browser such as Chrome.',
        ],
        video: null,
      },
      {
        id: 'ts-logout',
        q: 'I keep getting logged out',
        steps: [
          'Sessions expire after a period of inactivity.',
          'Logging in on another device signs you out of the earlier one.',
          'If it happens repeatedly, ask your admin to check whether your account is shared.',
        ],
        video: null,
      },
      {
        id: 'ts-wrong-data',
        q: 'A student or a class is missing from a list',
        steps: [
          'Check the academic year selected in the top bar.',
          'Check the grade and section filters on the screen.',
          'Confirm the student is active and not transferred out.',
          'If the class itself is missing, add it under Access Control > Class and Section.',
        ],
        video: null,
      },
    ],
  },
];

export const ROUTE_CATEGORY_MAP = [
  { match: ['/news', '/messages', '/circulars', '/consentforms', '/feedback', '/com-dashboard', '/contact', '/birthday-post', '/notification'], category: 'communication' },
  { match: ['/timetables', '/homework', '/examtimetables', '/studymaterials', '/marks', '/attendance', '/schoolcalendar'], category: 'academics' },
  { match: ['/profile'], category: 'students-staff' },
  { match: ['/fee'], category: 'fees' },
  { match: ['/transport', '/asset', '/inventory'], category: 'transport' },
  { match: ['/approvals', '/access'], category: 'approvals-access' },
  { match: ['/complaints'], category: 'complaints' },
];

export const getCategoryIdForPath = (pathname) => {
  const path = String(pathname || '');
  const hit = ROUTE_CATEGORY_MAP.find((entry) => entry.match.some((m) => path.includes(m)));
  return hit ? hit.category : null;
};

export const isCategoryAllowed = (category, hasAccess) => {
  if (!category.mainMenus || !category.mainMenus.length) return true;
  return category.mainMenus.some((menu) => hasAccess(menu));
};

export const getVisibleCategories = (hasAccess) =>
  HELP_CATEGORIES.filter((category) => isCategoryAllowed(category, hasAccess));

export const searchArticles = (categories, query) => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const results = [];
  categories.forEach((category) => {
    category.articles.forEach((article) => {
      const haystack = [article.q, ...(article.steps || []), article.note || ''].join(' ').toLowerCase();
      if (haystack.includes(q)) results.push({ ...article, category });
    });
  });
  return results;
};

export const getPopularArticles = (categories, limit = 6) => {
  const results = [];
  categories.forEach((category) => {
    category.articles.forEach((article) => {
      if (article.popular) results.push({ ...article, category });
    });
  });
  return results.slice(0, limit);
};
