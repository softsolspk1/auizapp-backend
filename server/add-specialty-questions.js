// Simple script to add Specialty category and questions
// This can be run when the server is running

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample admin credentials (you'll need to create an admin user first)
const ADMIN_CREDENTIALS = {
  email: 'admin@hilton.com',
  password: 'admin123'
};

const specialtyQuestions = [
  {
    question: 'Which medical specialty focuses on the diagnosis and treatment of heart diseases?',
    options: ['Cardiology', 'Neurology', 'Dermatology', 'Orthopedics'],
    correctAnswer: 0,
    explanation: 'Cardiology is the medical specialty that deals with disorders of the heart and blood vessels.',
    difficulty: 'easy'
  },
  {
    question: 'What is the primary focus of a Neurologist?',
    options: ['Heart conditions', 'Brain and nervous system disorders', 'Skin diseases', 'Bone fractures'],
    correctAnswer: 1,
    explanation: 'Neurologists specialize in diagnosing and treating disorders of the brain, spinal cord, and nervous system.',
    difficulty: 'easy'
  },
  {
    question: 'Which specialist would you consult for a skin rash or mole examination?',
    options: ['Cardiologist', 'Dermatologist', 'Gastroenterologist', 'Pulmonologist'],
    correctAnswer: 1,
    explanation: 'Dermatologists specialize in conditions affecting the skin, hair, and nails.',
    difficulty: 'easy'
  },
  {
    question: 'What does a Pulmonologist specialize in?',
    options: ['Heart diseases', 'Lung and respiratory system', 'Digestive system', 'Kidney diseases'],
    correctAnswer: 1,
    explanation: 'Pulmonologists focus on diseases and conditions of the lungs and respiratory system.',
    difficulty: 'medium'
  },
  {
    question: 'Which medical specialty deals with the digestive system?',
    options: ['Cardiology', 'Gastroenterology', 'Neurology', 'Dermatology'],
    correctAnswer: 1,
    explanation: 'Gastroenterologists specialize in the digestive system, including the stomach, intestines, liver, and pancreas.',
    difficulty: 'medium'
  },
  {
    question: 'What is the role of an Endocrinologist?',
    options: ['Treating heart conditions', 'Managing hormone disorders', 'Treating skin conditions', 'Handling bone fractures'],
    correctAnswer: 1,
    explanation: 'Endocrinologists specialize in disorders of the endocrine system, including diabetes, thyroid problems, and hormone imbalances.',
    difficulty: 'medium'
  },
  {
    question: 'Which specialist would perform a colonoscopy?',
    options: ['Cardiologist', 'Gastroenterologist', 'Neurologist', 'Dermatologist'],
    correctAnswer: 1,
    explanation: 'Gastroenterologists perform colonoscopies to examine the colon and rectum for abnormalities.',
    difficulty: 'medium'
  },
  {
    question: 'What does a Nephrologist specialize in?',
    options: ['Heart diseases', 'Kidney diseases', 'Lung conditions', 'Skin disorders'],
    correctAnswer: 1,
    explanation: 'Nephrologists specialize in kidney diseases and conditions affecting kidney function.',
    difficulty: 'hard'
  },
  {
    question: 'Which medical specialty focuses on cancer treatment?',
    options: ['Cardiology', 'Oncology', 'Neurology', 'Dermatology'],
    correctAnswer: 1,
    explanation: 'Oncologists specialize in the diagnosis and treatment of cancer, including chemotherapy and radiation therapy.',
    difficulty: 'hard'
  },
  {
    question: 'What is the primary focus of a Rheumatologist?',
    options: ['Heart conditions', 'Joint and autoimmune diseases', 'Skin problems', 'Lung diseases'],
    correctAnswer: 1,
    explanation: 'Rheumatologists specialize in autoimmune diseases and conditions affecting joints, muscles, and bones.',
    difficulty: 'hard'
  }
];

async function addSpecialtyCategoryAndQuestions() {
  try {
    console.log('Adding Specialty category and questions...');
    
    // First, create the Specialty category
    const categoryResponse = await axios.post(`${BASE_URL}/categories`, {
      name: 'Specialty',
      description: 'Medical specialty questions covering various medical fields and subspecialties'
    });
    
    console.log('Specialty category created:', categoryResponse.data);
    const categoryId = categoryResponse.data._id;
    
    // Add questions to the category
    for (const questionData of specialtyQuestions) {
      try {
        const questionResponse = await axios.post(`${BASE_URL}/questions`, {
          ...questionData,
          category: categoryId
        });
        console.log('Question added:', questionResponse.data.question);
      } catch (error) {
        console.error('Error adding question:', error.response?.data || error.message);
      }
    }
    
    console.log('Specialty category and questions setup complete!');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the script
addSpecialtyCategoryAndQuestions();

