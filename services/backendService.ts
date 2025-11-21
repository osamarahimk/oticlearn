
import { Document, LibraryResource, StudentGrade, TimetableEntry, FinancialStatus, CalendarEvent } from '../types';

// Simulating a database delay
const DELAY = 800;

// In-memory storage for the session (Simulating a database)
let mockDbDocuments: Document[] = [];

// In-memory events
let mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Calculus Midterm', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'Exam', emailReminder: true, description: 'Chapters 1-5' },
    { id: '2', title: 'Group Study: React', date: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'Study', emailReminder: false, description: 'Review hooks' },
    { id: '3', title: 'Project Submission', date: new Date(new Date().setDate(new Date().getDate() + 5)), type: 'Deadline', emailReminder: true, description: 'Final Report' },
];

/**
 * Simulates uploading a file to a Storage Bucket (e.g., AWS S3, Firebase Storage).
 * Returns a public access URL (simulated via Blob URL).
 */
export const uploadFileToStorage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Simulate network latency for upload
    setTimeout(() => {
      try {
        // Create a persistent Blob URL that mimics a storage URL
        // In a real app, this would be an https://storage.googleapis.com/... URL
        const blobUrl = URL.createObjectURL(file);
        resolve(blobUrl);
      } catch (error) {
        reject(new Error("Failed to upload file to storage bucket."));
      }
    }, 1500);
  });
};

/**
 * Simulates parsing text content from a file via a Cloud Function.
 */
export const extractTextContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
         // In a real backend, a library like pdf-parse would run here.
         // For this demo, we return a placeholder if we can't parse client-side easily.
         resolve("PDF Content successfully uploaded. Use the 'Ask AI' feature to query the visual content of this PDF.");
      } else if (file.name.endsWith('.docx')) {
         resolve("DOCX Content successfully uploaded. Text analysis available.");
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = () => reject(new Error("Failed to read text content."));
        reader.readAsText(file);
      }
    }, 1000);
  });
};

/**
 * Simulates creating a document record in a Database (e.g., Firestore, MongoDB).
 */
export const createDocumentRecord = async (
  title: string, 
  file: File, 
  fileUrl: string, 
  textContent: string
): Promise<Document> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDoc: Document = {
        id: crypto.randomUUID(),
        title: title,
        type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.docx') ? 'DOCX' : 'TXT',
        uploadDate: new Date().toISOString(),
        category: 'Personal Upload',
        content: textContent,
        contextReady: false, // AI processing starts after this
        fileUrl: fileUrl,
      };
      
      mockDbDocuments = [newDoc, ...mockDbDocuments];
      resolve(newDoc);
    }, DELAY);
  });
};

/**
 * Simulates fetching documents from the database.
 */
export const fetchDocuments = async (): Promise<Document[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockDbDocuments]);
    }, DELAY);
  });
};

/**
 * Simulates updating a document field (e.g., setting contextReady to true).
 */
export const updateDocumentStatus = async (id: string, updates: Partial<Document>): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockDbDocuments = mockDbDocuments.map(doc => 
                doc.id === id ? { ...doc, ...updates } : doc
            );
            resolve();
        }, 500);
    });
}

// --- Open Library Integration Service (Mock) ---
export const fetchLibraryResources = async (query: string): Promise<LibraryResource[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allResources: LibraryResource[] = [
                { id: '1', title: 'Advanced Artificial Intelligence', author: 'S. Russell', type: 'Book', source: 'OpenLibrary', url: '#', year: 2020 },
                { id: '2', title: 'Research Methods in Uganda', author: 'Dr. J. Okello', type: 'Journal', source: 'RENU', url: '#', year: 2023 },
                { id: '3', title: 'Computer Vision Algorithms', author: 'IEEE', type: 'Paper', source: 'IEEE Xplore', url: '#', year: 2022 },
                { id: '4', title: 'History of East Africa', author: 'M. K. John', type: 'Book', source: 'MakLib', url: '#', year: 2018 },
                { id: '5', title: 'Data Structures Implementation', author: 'A. Tanenbaum', type: 'Book', source: 'OpenLibrary', url: '#', year: 2019 },
            ];
            
            if (!query) resolve(allResources);
            else {
                const lowerQ = query.toLowerCase();
                resolve(allResources.filter(r => r.title.toLowerCase().includes(lowerQ) || r.author.toLowerCase().includes(lowerQ)));
            }
        }, 600);
    });
}

// --- Student Portal Integration Service (Mock) ---
export const fetchStudentPortalData = async (): Promise<{
    grades: StudentGrade[];
    timetable: TimetableEntry[];
    finance: FinancialStatus;
}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                grades: [
                    { courseCode: 'CSC3101', courseTitle: 'Artificial Intelligence', grade: 'A', score: 85, credits: 4 },
                    { courseCode: 'CSC3102', courseTitle: 'Software Engineering', grade: 'B+', score: 78, credits: 4 },
                    { courseCode: 'MTH3100', courseTitle: 'Numerical Analysis', grade: 'A-', score: 81, credits: 3 },
                    { courseCode: 'BIT3104', courseTitle: 'Web Frameworks', grade: 'A', score: 90, credits: 4 },
                ],
                timetable: [
                    { id: '1', day: 'Monday', time: '08:00 - 10:00', course: 'CSC3101', room: 'Lab 3', type: 'Lecture' },
                    { id: '2', day: 'Monday', time: '14:00 - 16:00', course: 'BIT3104', room: 'Lab 1', type: 'Lab' },
                    { id: '3', day: 'Tuesday', time: '10:00 - 13:00', course: 'MTH3100', room: 'Room 4B', type: 'Lecture' },
                    { id: '4', day: 'Wednesday', time: '09:00 - 11:00', course: 'CSC3102', room: 'Main Hall', type: 'Lecture' },
                    { id: '5', day: 'Thursday', time: '14:00 - 17:00', course: 'Project Work', room: 'Hub', type: 'Tutorial' },
                ],
                finance: {
                    balance: 450000,
                    currency: 'UGX',
                    status: 'Pending',
                    nextDueDate: '2025-11-30',
                    history: [
                        { date: '2025-08-15', description: 'Tuition Payment', amount: -1500000 },
                        { date: '2025-08-01', description: 'Semester Fees Invoice', amount: 1950000 }
                    ]
                }
            });
        }, 800);
    });
}

// --- Calendar Service ---

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...mockEvents]), 600);
    });
}

export const createEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newEvent = { ...event, id: crypto.randomUUID() };
            mockEvents.push(newEvent);
            
            if (event.emailReminder) {
                console.log(`[Mock Email Service] Scheduled email to student@demo.com for event: ${event.title} on ${event.date}`);
            }
            
            resolve(newEvent);
        }, 800);
    });
}
