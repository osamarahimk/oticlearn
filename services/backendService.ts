
import { Document, LibraryResource, StudentGrade, TimetableEntry, FinancialStatus, CalendarEvent } from '../types';
import { db, storage } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';

/**
 * Uploads a file to Real Firebase Storage.
 * Requires Firebase Storage Rules to allow write access.
 */
export const uploadFileToStorage = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    // Fallback for demo purposes if user hasn't configured CORS/Storage rules yet:
    console.warn("Falling back to local Object URL due to Storage error (likely config/CORS).");
    return URL.createObjectURL(file);
  }
};

/**
 * Extracts text content.
 * Note: Doing complex OCR or PDF parsing strictly client-side is limited.
 * In a production app, this would trigger a Firebase Cloud Function.
 */
export const extractTextContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
         // Placeholder: Real PDF parsing requires a library like pdf.js or a backend function
         resolve("PDF Content successfully uploaded. Use the 'Ask AI' feature to query the visual content of this PDF.");
    } else if (file.name.endsWith('.docx')) {
         resolve("DOCX Content successfully uploaded. Text analysis available.");
    } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = () => reject(new Error("Failed to read text content."));
        reader.readAsText(file);
    }
  });
};

/**
 * Creates a document record in Firestore.
 */
export const createDocumentRecord = async (
  title: string, 
  file: File, 
  fileUrl: string, 
  textContent: string
): Promise<Document> => {
  try {
      const newDocData = {
        title: title,
        type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.docx') ? 'DOCX' : 'TXT',
        uploadDate: new Date().toISOString(),
        category: 'Personal Upload',
        content: textContent,
        contextReady: false,
        fileUrl: fileUrl,
      };

      const docRef = await addDoc(collection(db, "documents"), newDocData);
      
      return {
          id: docRef.id,
          ...newDocData
      } as Document;
  } catch (error) {
      console.error("Error creating doc in Firestore:", error);
      throw error;
  }
};

/**
 * Fetches documents from Firestore.
 */
export const fetchDocuments = async (): Promise<Document[]> => {
  try {
      const q = query(collection(db, "documents"), orderBy("uploadDate", "desc"));
      const querySnapshot = await getDocs(q);
      const docs: Document[] = [];
      querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() } as Document);
      });
      return docs;
  } catch (error) {
      console.error("Error fetching docs from Firestore:", error);
      return [];
  }
};

/**
 * Updates a document field in Firestore.
 */
export const updateDocumentStatus = async (id: string, updates: Partial<Document>): Promise<void> => {
    try {
        const docRef = doc(db, "documents", id);
        await updateDoc(docRef, updates);
    } catch (error) {
        console.error("Error updating doc:", error);
    }
}

/**
 * Deletes a document from Firestore.
 */
export const deleteDocumentRecord = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, "documents", id));
    } catch (error) {
        console.error("Error deleting doc:", error);
    }
}

// --- Mock Services for Read-Only / External Integrations ---
// These remain mocks because we don't have access to the actual University APIs
// or OpenLibrary APIs in this context, but they could be replaced by real fetch() calls.

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

export const fetchStudentPortalData = async (): Promise<{
    grades: StudentGrade[];
    timetable: TimetableEntry[];
    finance: FinancialStatus;
}> => {
    // In a real app, this would be: await fetch('https://portal.makerere.ac.ug/api/student/data')
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

// --- Calendar Service (Firestore) ---

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
    try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);
        const events: CalendarEvent[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            events.push({ 
                id: doc.id, 
                ...data,
                date: data.date.toDate() // Convert Firestore Timestamp to JS Date
            } as CalendarEvent);
        });
        return events;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export const createEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            ...event,
            // Firestore stores dates as Timestamps, usually auto-converted by SDK
        });
        
        return { ...event, id: docRef.id } as CalendarEvent;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}
