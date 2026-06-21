const mongoose = require('mongoose');
const Category = require('./models/Category');
const Question = require('./models/Question');

async function createSpecialtyCategory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hilton-quiz', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if Specialty category already exists
    let specialtyCategory = await Category.findOne({ name: 'Specialty' });
    
    if (!specialtyCategory) {
      // Create Specialty category
      specialtyCategory = new Category({
        name: 'Specialty',
        description: 'Medical specialty questions covering various medical fields and subspecialties',
        isActive: true
      });

      await specialtyCategory.save();
      console.log('Specialty category created:', specialtyCategory._id);
    } else {
      console.log('Specialty category already exists:', specialtyCategory._id);
    }

    // Create 10 specialty questions
    const specialtyQuestions = [
      {
        question: 'Which medical specialty focuses on the diagnosis and treatment of heart diseases?',
        options: ['Cardiology', 'Neurology', 'Dermatology', 'Orthopedics'],
        correctAnswer: 0,
        explanation: 'Cardiology is the medical specialty that deals with disorders of the heart and blood vessels.',
        category: specialtyCategory._id,
        difficulty: 'easy'
      },
      {
        question: 'What is the primary focus of a Neurologist?',
        options: ['Heart conditions', 'Brain and nervous system disorders', 'Skin diseases', 'Bone fractures'],
        correctAnswer: 1,
        explanation: 'Neurologists specialize in diagnosing and treating disorders of the brain, spinal cord, and nervous system.',
        category: specialtyCategory._id,
        difficulty: 'easy'
      },
      {
        question: 'Which specialist would you consult for a skin rash or mole examination?',
        options: ['Cardiologist', 'Dermatologist', 'Gastroenterologist', 'Pulmonologist'],
        correctAnswer: 1,
        explanation: 'Dermatologists specialize in conditions affecting the skin, hair, and nails.',
        category: specialtyCategory._id,
        difficulty: 'easy'
      },
      {
        question: 'What does a Pulmonologist specialize in?',
        options: ['Heart diseases', 'Lung and respiratory system', 'Digestive system', 'Kidney diseases'],
        correctAnswer: 1,
        explanation: 'Pulmonologists focus on diseases and conditions of the lungs and respiratory system.',
        category: specialtyCategory._id,
        difficulty: 'medium'
      },
      {
        question: 'Which medical specialty deals with the digestive system?',
        options: ['Cardiology', 'Gastroenterology', 'Neurology', 'Dermatology'],
        correctAnswer: 1,
        explanation: 'Gastroenterologists specialize in the digestive system, including the stomach, intestines, liver, and pancreas.',
        category: specialtyCategory._id,
        difficulty: 'medium'
      },
      {
        question: 'What is the role of an Endocrinologist?',
        options: ['Treating heart conditions', 'Managing hormone disorders', 'Treating skin conditions', 'Handling bone fractures'],
        correctAnswer: 1,
        explanation: 'Endocrinologists specialize in disorders of the endocrine system, including diabetes, thyroid problems, and hormone imbalances.',
        category: specialtyCategory._id,
        difficulty: 'medium'
      },
      {
        question: 'Which specialist would perform a colonoscopy?',
        options: ['Cardiologist', 'Gastroenterologist', 'Neurologist', 'Dermatologist'],
        correctAnswer: 1,
        explanation: 'Gastroenterologists perform colonoscopies to examine the colon and rectum for abnormalities.',
        category: specialtyCategory._id,
        difficulty: 'medium'
      },
      {
        question: 'What does a Nephrologist specialize in?',
        options: ['Heart diseases', 'Kidney diseases', 'Lung conditions', 'Skin disorders'],
        correctAnswer: 1,
        explanation: 'Nephrologists specialize in kidney diseases and conditions affecting kidney function.',
        category: specialtyCategory._id,
        difficulty: 'hard'
      },
      {
        question: 'Which medical specialty focuses on cancer treatment?',
        options: ['Cardiology', 'Oncology', 'Neurology', 'Dermatology'],
        correctAnswer: 1,
        explanation: 'Oncologists specialize in the diagnosis and treatment of cancer, including chemotherapy and radiation therapy.',
        category: specialtyCategory._id,
        difficulty: 'hard'
      },
      {
        question: 'What is the primary focus of a Rheumatologist?',
        options: ['Heart conditions', 'Joint and autoimmune diseases', 'Skin problems', 'Lung diseases'],
        correctAnswer: 1,
        explanation: 'Rheumatologists specialize in autoimmune diseases and conditions affecting joints, muscles, and bones.',
        category: specialtyCategory._id,
        difficulty: 'hard'
      }
    ];

    let questionsCreated = 0;
    for (const questionData of specialtyQuestions) {
      // Check if question already exists
      const existingQuestion = await Question.findOne({ 
        question: questionData.question,
        category: specialtyCategory._id 
      });
      
      if (!existingQuestion) {
        const question = new Question(questionData);
        await question.save();
        questionsCreated++;
        console.log('Question created:', question.question);
      } else {
        console.log('Question already exists:', questionData.question);
      }
    }

    // Update category question count
    const totalQuestions = await Question.countDocuments({ category: specialtyCategory._id });
    await Category.findByIdAndUpdate(specialtyCategory._id, { questionCount: totalQuestions });
    
    console.log(`Specialty category setup complete! ${questionsCreated} new questions added. Total questions: ${totalQuestions}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

createSpecialtyCategory();