import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const MultiplayerScreen = ({ navigation }) => {
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    // Simulate room creation
    setTimeout(() => {
      setIsCreatingRoom(false);
      Alert.alert(
        'Room Created',
        'Share this room ID with other players: ABC123',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to multiplayer quiz with room ID
              navigation.navigate('MultiplayerQuiz', { roomId: 'ABC123', isHost: true });
            }
          }
        ]
      );
    }, 2000);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID');
      return;
    }
    
    setIsJoiningRoom(true);
    // Simulate joining room
    setTimeout(() => {
      setIsJoiningRoom(false);
      navigation.navigate('MultiplayerQuiz', { roomId: roomId.trim(), isHost: false });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="people" size={48} color="white" />
          <Text style={styles.title}>Multiplayer Quiz</Text>
          <Text style={styles.subtitle}>Compete with other doctors</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Create Room */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create a Room</Text>
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Ionicons name="add-circle" size={24} color="#10b981" />
              <Text style={styles.actionTitle}>Start New Game</Text>
            </View>
            <Text style={styles.actionDescription}>
              Create a new multiplayer room and invite other players to join
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateRoom}
              disabled={isCreatingRoom}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>
                  {isCreatingRoom ? 'Creating...' : 'Create Room'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Join Room */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join a Room</Text>
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Ionicons name="enter" size={24} color="#3b82f6" />
              <Text style={styles.actionTitle}>Enter Room ID</Text>
            </View>
            <Text style={styles.actionDescription}>
              Enter a room ID to join an existing multiplayer game
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Room ID"
                placeholderTextColor="#9ca3af"
                value={roomId}
                onChangeText={setRoomId}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleJoinRoom}
              disabled={isJoiningRoom}
            >
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>
                  {isJoiningRoom ? 'Joining...' : 'Join Room'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Multiplayer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Multiplayer Works</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="flash" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>Double points for correct answers (20 points)</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>Real-time competition with other players</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="trophy" size={20} color="#10b981" />
              <Text style={styles.infoText}>Leaderboard updates after each game</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color="#8b5cf6" />
              <Text style={styles.infoText}>Play with 2-8 players simultaneously</Text>
            </View>
          </View>
        </View>
      </View>
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
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontFamily: 'Inter-Regular',
  },
  actionButton: {
    width: '100%',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
});

export default MultiplayerScreen;


