import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ResultsScreen = ({ navigation, route }) => {
  const { results, category, gameMode, answers, questions } = route.params;
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent! Outstanding performance!';
    if (score >= 80) return 'Great job! Well done!';
    if (score >= 70) return 'Good work! Keep it up!';
    if (score >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  const accuracy = ((results.correctAnswers / results.totalQuestions) * 100).toFixed(1);

  // Get wrong answers with details
  const getWrongAnswers = () => {
    if (!questions || !answers) return [];
    
    return questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;
      
      if (!isCorrect) {
        return {
          question: question.question,
          userAnswer: userAnswer ? question.options[userAnswer.answer] : 'No answer',
          correctAnswer: question.options[question.correctAnswer],
          explanation: question.explanation || 'No explanation available',
          questionNumber: index + 1
        };
      }
      return null;
    }).filter(Boolean);
  };

  const wrongAnswers = getWrongAnswers();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={48} color="white" />
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.subtitle}>{category.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: getScoreColor(accuracy) }]}>
              {results.score}
            </Text>
            <Text style={styles.scoreLabel}>Points Earned</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{results.correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{results.wrongAnswers}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Performance Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>{getScoreMessage(accuracy)}</Text>
        </View>

        {/* Detailed Results Toggle */}
        {wrongAnswers.length > 0 && (
          <TouchableOpacity
            style={styles.detailedToggle}
            onPress={() => setShowDetailedResults(!showDetailedResults)}
          >
            <Text style={styles.detailedToggleText}>
              {showDetailedResults ? 'Hide' : 'Show'} Wrong Answers ({wrongAnswers.length})
            </Text>
            <Ionicons 
              name={showDetailedResults ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#3b82f6" 
            />
          </TouchableOpacity>
        )}

        {/* Detailed Wrong Answers */}
        {showDetailedResults && wrongAnswers.length > 0 && (
          <View style={styles.detailedResults}>
            <Text style={styles.detailedTitle}>Wrong Answers Review</Text>
            {wrongAnswers.map((wrongAnswer, index) => (
              <View key={index} style={styles.wrongAnswerCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Question {wrongAnswer.questionNumber}</Text>
                </View>
                <Text style={styles.wrongQuestionText}>{wrongAnswer.question}</Text>
                
                <View style={styles.answerComparison}>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <View style={styles.wrongAnswerBox}>
                      <Text style={styles.wrongAnswerText}>{wrongAnswer.userAnswer}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Correct Answer:</Text>
                    <View style={styles.correctAnswerBox}>
                      <Text style={styles.correctAnswerText}>{wrongAnswer.correctAnswer}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>Explanation:</Text>
                  <Text style={styles.explanationText}>{wrongAnswer.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Game Mode Info */}
        <View style={styles.modeCard}>
          <View style={styles.modeHeader}>
            <Ionicons 
              name={gameMode === 'multiplayer' ? 'people' : 'person'} 
              size={24} 
              color="#3b82f6" 
            />
            <Text style={styles.modeTitle}>
              {gameMode === 'multiplayer' ? 'Multiplayer Mode' : 'Single Player Mode'}
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            {gameMode === 'multiplayer' 
              ? 'Double points earned in multiplayer mode!' 
              : 'Standard scoring applied in single player mode.'
            }
          </Text>
        </View>

        {/* Time Spent */}
        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <Ionicons name="time" size={24} color="#10b981" />
            <Text style={styles.timeTitle}>Time Spent</Text>
          </View>
          <Text style={styles.timeText}>
            {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Category', { category })}
          >
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.actionButtonText}>Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: -20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  detailedToggle: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailedToggleText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  detailedResults: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  wrongAnswerCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  questionHeader: {
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: 'Inter-SemiBold',
  },
  wrongQuestionText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  answerComparison: {
    marginBottom: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 100,
    fontFamily: 'Inter-SemiBold',
  },
  wrongAnswerBox: {
    flex: 1,
    backgroundColor: '#fecaca',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  wrongAnswerText: {
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  correctAnswerBox: {
    flex: 1,
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  correctAnswerText: {
    color: '#16a34a',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  explanationBox: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  explanationText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  modeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  modeDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  timeText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default ResultsScreen;


