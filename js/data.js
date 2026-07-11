const routines = {
    "ece21": {
        "id": "ece21",
        "name": "ECE 2-1 (KUET)",
        "subtitle": "Khulna University of Engineering & Technology",
        "teacherDirectory": {
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
        },
        "data": {
            "Sun": [
                { "time": "08:50 AM – 09:40 AM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Ayesha mam"], "period": "2nd Period", "room": "ECE-102" },
                { "time": "09:40 AM – 10:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Rahul sir", "Arnob sir"], "period": "3rd Period", "room": "ECE-102" },
                { "time": "11:30 AM – 01:10 PM", "code": "ME 2110", "name": "Mechanical Engineering Sessional", "type": "Sessional", "instructors": ["Shadid sir", "AMB"], "group": "Group A/B", "period": "5th & 6th Period", "room": "ECE-102" }
            ],
            "Mon": [
                { "time": "10:40 AM – 11:30 AM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Rahul sir"], "period": "4th Period", "room": "ECE-102" },
                { "time": "11:30 AM – 12:20 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Aarif sir"], "period": "5th Period", "room": "ECE-102" },
                { "time": "12:20 PM – 01:10 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Shafrin mam", "Ayesha mam"], "period": "6th Period", "room": "ECE-102" },
                { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["Foisal Sir", "Sharif sir"], "group": "Group A/B", "period": "7th, 8th & 9th Period", "room": "ECE-102" }
            ],
            "Tue": [
                { "time": "09:40 AM – 10:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Foisal Sir"], "period": "3rd Period", "room": "ECE-102" },
                { "time": "10:40 AM – 11:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Masuk sir"], "period": "4th Period", "room": "ECE-102" },
                { "time": "11:30 AM – 12:20 PM", "code": "ECE 2107", "name": "Electromagnetic Fields & Waves", "type": "Theory", "instructors": ["Arnob sir"], "period": "5th Period", "room": "ECE-102" },
                { "time": "12:20 PM – 01:10 PM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Aarif sir", "Shakil sir"], "period": "6th Period", "room": "ECE-102" }
            ],
            "Wed": [
                { "time": "08:00 AM – 10:30 AM", "code": "CSE 2100", "name": "Software Development Sessional", "type": "Sessional", "instructors": ["Ayesha mam", "SI"], "group": "Group A/B", "period": "1st, 2nd & 3rd Period", "room": "ECE-102" },
                { "time": "10:40 AM – 11:30 AM", "code": "Math 2109", "name": "Fourier Analysis & Laplace Transform", "type": "Theory", "instructors": ["Shakil sir"], "period": "4th Period", "room": "ECE-102" },
                { "time": "11:30 AM – 12:20 PM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Foisal Sir", "Sharif sir"], "period": "5th Period", "room": "ECE-102" },
                { "time": "12:20 PM – 01:10 PM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Shonglap sir"], "period": "6th Period", "room": "ECE-102" },
                { "time": "02:30 PM – 05:00 PM", "code": "ECE 2104", "name": "Digital Electronics Sessional", "type": "Sessional", "instructors": ["Foisal Sir", "Sharif sir"], "group": "Group A/B", "period": "7th, 8th & 9th Period", "room": "ECE-102" }
            ],
            "Thu": [
                { "time": "09:40 AM – 10:30 AM", "code": "ECE 2105", "name": "Network Analysis & Synthesis", "type": "Theory", "instructors": ["Masuk sir", "Shonglap sir"], "period": "3rd Period", "room": "ECE-102" },
                { "time": "10:40 AM – 11:30 AM", "code": "ECE 2103", "name": "Digital Electronics", "type": "Theory", "instructors": ["Sharif sir"], "period": "4th Period", "room": "ECE-102" },
                { "time": "11:30 AM – 12:20 PM", "code": "ECE 2101", "name": "Electronic Devices & Circuits I", "type": "Theory", "instructors": ["Shafrin mam"], "period": "5th Period", "room": "ECE-102" },
                { "time": "02:30 PM – 04:10 PM", "code": "ECE 2102", "name": "Electronic Devices & Circuits I Sessional", "type": "Sessional", "instructors": ["Shafrin mam", "Ayesha mam"], "group": "Group A/B", "period": "7th & 8th Period", "notes": "Overlaps with ECE 2108 from 03:20 PM to 04:10 PM.", "room": "ECE-102" },
                { "time": "03:20 PM – 05:00 PM", "code": "ECE 2108", "name": "Numerical Analysis & Statistics Sessional", "type": "Sessional", "instructors": ["Rahul sir", "Arnob sir"], "group": "Group A/B", "period": "8th & 9th Period", "notes": "Overlaps with ECE 2102 from 03:20 PM to 04:10 PM.", "room": "ECE-102" }
            ]
        }
    },
    "ll": {
        "id": "ll",
        "name": "DSA",
        "subtitle": "East West University (EWU)",
        "palette": {
            "bg": "#EAE2F8",
            "card": "#FFFFFF",
            "border": "#D1C4E9",
            "text": "#311B92",
            "muted": "#673AB7"
        },
        "teacherDirectory": {},
        "data": {
            "Sun": [
                { "time": "11:50 AM – 01:20 PM", "code": "STA293", "name": "STA293 (SEC 2)", "type": "Theory", "instructors": [], "room": "FUB-903", "period": "N/A" },
                { "time": "01:30 PM – 03:00 PM", "code": "MAT291", "name": "MAT291 (SEC 3)", "type": "Theory", "instructors": [], "room": "AB3-401", "period": "N/A" }
            ],
            "Mon": [
                { "time": "08:30 AM – 10:00 AM", "code": "CS295", "name": "CS295 (SEC 3)", "type": "Theory", "instructors": [], "room": "AB1-902", "period": "N/A" }
            ],
            "Tue": [
                { "time": "08:00 AM – 10:00 AM", "code": "CS295 LAB", "name": "CS295 LAB (SEC 3)", "type": "Sessional", "instructors": [], "room": "530 (C. LAB-2)", "period": "N/A" },
                { "time": "10:10 AM – 11:40 AM", "code": "GEN7226", "name": "GEN7226 (SEC 19)", "type": "Theory", "instructors": [], "room": "AB3-302", "period": "N/A" },
                { "time": "01:30 PM – 03:00 PM", "code": "MAT291", "name": "MAT291 (SEC 3)", "type": "Theory", "instructors": [], "room": "AB3-401", "period": "N/A" }
            ],
            "Wed": [
                { "time": "08:30 AM – 10:00 AM", "code": "CS295", "name": "CS295 (SEC 3)", "type": "Theory", "instructors": [], "room": "AB1-902", "period": "N/A" }
            ],
            "Thu": [
                { "time": "10:10 AM – 11:40 AM", "code": "GEN7226", "name": "GEN7226 (SEC 19)", "type": "Theory", "instructors": [], "room": "AB3-302", "period": "N/A" },
                { "time": "11:50 AM – 01:20 PM", "code": "STA293", "name": "STA293 (SEC 2)", "type": "Theory", "instructors": [], "room": "FUB-903", "period": "N/A" }
            ]
        }
    }
};
