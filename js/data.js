const teacherDirectory = {
    "Foisal Sir": "Prof. Dr. Md. Foisal Hossain",
    "Sharif sir": "Prof. Dr. Sk. Shariful Alam",
    "Rahul sir": "Prof. Dr. Sheikh Md. Rahul Islam",
    "Masuk sir": "Mr. Mushfiquar Rahman Masuk",
    "Shonglap sir": "Mr. Nawaz Talukder Sanglap",
    "Arnob sir": "Mr. Minhajul Islam Annob",
    "Shafrin mam": "Ms. Shafrin Sultana",
    "Ayesha mam": "Ms. Aysha Tabassum",
    "Shadid sir": "Prof. Dr. Md. Shahidul Islam",
    "AMB": "Mr. Al Muttaki Billah",
    "SI": "Ms. Mst. Sadia Islam",
    "Aarif sir": "Mr. S.M. Arif Hossen",
    "Shakil sir": "Mr. Md. Shakil Hossain"
};

const routineData = {
    "Sun": [
        { "time": "08:50 AM – 09:40 AM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Ayesha mam"], "period": "2nd Period" },
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Rahul sir", "Arnob sir"], "period": "3rd Period" },
        { "time": "11:30 AM – 01:10 PM", "code": "ME 2110", "name": "Mechanical Engineering Sessional", "type": "Sessional", "instructors": ["Shadid sir", "AMB"], "group": "Group A/B", "period": "5th & 6th Period" }
    ],
    "Mon": [
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Rahul sir"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Aarif sir"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Shafrin mam", "Ayesha mam"], "period": "6th Period" },
        { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["Foisal Sir", "Sharif sir"], "group": "Group A/B", "period": "7th, 8th & 9th Period" }
    ],
    "Tue": [
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Foisal Sir"], "period": "3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Masuk sir"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Arnob sir"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Aarif sir", "Shakil sir"], "period": "6th Period" }
    ],
    "Wed": [
        { "time": "08:00 AM – 10:30 AM", "code": "CSE 2100", "name": "Software Development Sessional", "type": "Sessional", "instructors": ["Ayesha mam", "SI"], "group": "Group A/B", "period": "1st, 2nd & 3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Shakil sir"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Foisal Sir", "Sharif sir"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Shonglap sir"], "period": "6th Period" },
        { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["Foisal Sir", "Sharif sir"], "group": "Group A/B", "period": "7th, 8th & 9th Period" }
    ],
    "Thu": [
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Masuk sir", "Shonglap sir"], "period": "3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Sharif sir"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Shafrin mam"], "period": "5th Period" },
        { "time": "02:30 PM – 04:10 PM", "code": "ECE 2102", "name": "Electronic Devices & Circuits I Sessional", "type": "Sessional", "instructors": ["Shafrin mam", "Ayesha mam"], "group": "Group A/B", "period": "7th & 8th Period", "notes": "Overlaps with ECE 2108 from 03:20 PM to 04:10 PM." },
        { "time": "03:20 PM – 05:00 PM", "code": "ECE 2108", "name": "Numerical Analysis & Statistics Sessional", "type": "Sessional", "instructors": ["Rahul sir", "Arnob sir"], "group": "Group A/B", "period": "8th & 9th Period", "notes": "Overlaps with ECE 2102 from 03:20 PM to 04:10 PM." }
    ]
};
