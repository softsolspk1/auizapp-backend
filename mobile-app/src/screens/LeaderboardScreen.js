import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return { name: 'trophy', color: '#fbbf24' };
      case 1:
        return { name: 'medal', color: '#9ca3af' };
      case 2:
        return { name: 'medal', color: '#f59e0b' };
      default:
        return { name: 'person', color: '#6b7280' };
    }
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const rankIcon = getRankIcon(index);
    
    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
          <Text style={styles.rankNumber}>{index + 1}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Dr. {item.doctorName}</Text>
          <Text style={styles.userDetails}>
            {item.specialty} • {item.hospitalName}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{item.totalPoints}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="trophy" size={32} color="white" />
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Top performers</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={32} color="white" />
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Top performers</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
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
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  rankNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  userDetails: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    fontFamily: 'Inter-Bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
});

export default LeaderboardScreen;


