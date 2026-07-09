const teacherDirectory = {
    "FH": "Prof. Dr. Md. Foisal Hossain",
    "SSA": "Prof. Dr. Sk. Shariful Alam",
    "RI": "Prof. Dr. Sheikh Md. Rahul Islam",
    "MRM": "Mr. Mushfiquar Rahman Masuk",
    "NTS": "Mr. Nawaz Talukder Sanglap",
    "MI": "Mr. Minhajul Islam Annob",
    "SS": "Ms. Shafrin Sultana",
    "AT": "Ms. Aysha Tabassum",
    "MSI": "Prof. Dr. Md. Shahidul Islam",
    "AMB": "Mr. Al Muttaki Billah",
    "SI": "Ms. Mst. Sadia Islam",
    "AH": "Mr. S.M. Arif Hossen",
    "SH": "Mr. Md. Shakil Hossain"
};

const routineData = {
    "Sun": [
        { "time": "08:50 AM – 09:40 AM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["AT"], "period": "2nd Period" },
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["RI", "MI"], "period": "3rd Period" },
        { "time": "11:30 AM – 01:10 PM", "code": "ME 2110", "name": "Mechanical Engineering Sessional", "type": "Sessional", "instructors": ["MSI", "AMB"], "group": "Group A/B", "period": "5th & 6th Period" }
    ],
    "Mon": [
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["RI"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["AH"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["SS", "AT"], "period": "6th Period" },
        { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["FH", "SSA"], "group": "Group A/B", "period": "7th, 8th & 9th Period" }
    ],
    "Tue": [
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["FH"], "period": "3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["MRM"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["MI"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["AH", "SH"], "period": "6th Period" }
    ],
    "Wed": [
        { "time": "08:00 AM – 10:30 AM", "code": "CSE 2100", "name": "Software Development Sessional", "type": "Sessional", "instructors": ["AT", "SI"], "group": "Group A/B", "period": "1st, 2nd & 3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["SH"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["FH", "SSA"], "period": "5th Period" },
        { "time": "12:20 PM – 01:10 PM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["NTS"], "period": "6th Period" },
        { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["FH", "SSA"], "group": "Group A/B", "period": "7th, 8th & 9th Period" }
    ],
    "Thu": [
        { "time": "09:40 AM – 10:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["MRM", "NTS"], "period": "3rd Period" },
        { "time": "10:40 AM – 11:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["SSA"], "period": "4th Period" },
        { "time": "11:30 AM – 12:20 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["SS"], "period": "5th Period" },
        { "time": "02:30 PM – 04:10 PM", "code": "ECE 2102", "name": "Electronic Devices & Circuits I Sessional", "type": "Sessional", "instructors": ["SS", "AT"], "group": "Group A/B", "period": "7th & 8th Period", "notes": "Overlaps with ECE 2108 from 03:20 PM to 04:10 PM." },
        { "time": "03:20 PM – 05:00 PM", "code": "ECE 2108", "name": "Numerical Analysis & Statistics Sessional", "type": "Sessional", "instructors": ["RI", "MI"], "group": "Group A/B", "period": "8th & 9th Period", "notes": "Overlaps with ECE 2102 from 03:20 PM to 04:10 PM." }
    ]
};
