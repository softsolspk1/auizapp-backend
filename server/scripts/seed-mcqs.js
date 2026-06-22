const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data ingestion...');
  const filePath = path.join(__dirname, '../../mcqs.html');
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  console.log('File loaded, parsing HTML...');
  
  const $ = cheerio.load(htmlContent);
  let totalImported = 0;

  // We iterate over each topic section
  const topicSections = $('.topic-section');
  console.log(`Found ${topicSections.length} topic sections.`);

  for (let i = 0; i < topicSections.length; i++) {
    const section = $(topicSections[i]);
    const categoryName = section.find('.topic-header h2').text().trim();
    
    if (!categoryName) continue;

    console.log(`Processing category: ${categoryName}`);
    
    // Create or find category
    let category = await prisma.category.findUnique({
      where: { name: categoryName }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          description: `All questions related to ${categoryName}`,
          isActive: true
        }
      });
    }

    const questionCards = section.find('.question-card');
    console.log(`Found ${questionCards.length} questions in ${categoryName}`);
    
    const questionsToInsert = [];

    questionCards.each((j, card) => {
      const $card = $(card);
      const questionText = $card.find('.question-text').text().trim();
      
      const options = [];
      $card.find('.option').each((k, opt) => {
        // Remove the option label (e.g., "Option A") to get just the text
        const text = $(opt).contents().filter(function() {
          return this.nodeType === 3; // Text nodes
        }).text().trim();
        options.push(text);
      });

      const answerTextRaw = $card.find('.answer-text').text().trim();
      // Extracts "D" from "✓ Correct Answer: Option D"
      const match = answerTextRaw.match(/Option\s+([A-D])/i);
      let correctAnswerIndex = 0;
      if (match && match[1]) {
        const letter = match[1].toUpperCase();
        if (letter === 'A') correctAnswerIndex = 0;
        if (letter === 'B') correctAnswerIndex = 1;
        if (letter === 'C') correctAnswerIndex = 2;
        if (letter === 'D') correctAnswerIndex = 3;
      }

      const referenceText = $card.find('.reference-text').text().trim();

      questionsToInsert.push({
        question: questionText,
        options: options,
        correctAnswer: correctAnswerIndex,
        explanation: referenceText,
        categoryId: category.id,
        difficulty: 'medium',
        isActive: true
      });
    });

    // Batch insert questions for this category
    if (questionsToInsert.length > 0) {
      // Chunking for Prisma to avoid massive query size limits
      const chunkSize = 1000;
      for (let k = 0; k < questionsToInsert.length; k += chunkSize) {
        const chunk = questionsToInsert.slice(k, k + chunkSize);
        await prisma.question.createMany({
          data: chunk,
          skipDuplicates: true
        });
      }
      totalImported += questionsToInsert.length;
      
      // Update question count in category
      await prisma.category.update({
        where: { id: category.id },
        data: { questionCount: questionsToInsert.length }
      });
    }
  }

  console.log(`Data ingestion complete. Total questions imported: ${totalImported}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
