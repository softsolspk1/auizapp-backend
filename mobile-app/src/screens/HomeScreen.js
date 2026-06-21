import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>Dr. {user?.doctorName}</Text>
            <Text style={styles.userInfo}>{user?.specialty} • {user?.hospitalName}</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.totalPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.gamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Multiplayer')}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people" size={24} color="white" />
                <Text style={styles.quickActionText}>Multiplayer</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.quickActionText}>Leaderboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz Categories</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('Category', { category })}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name="book" size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryQuestionCount}>
                      {category.questionCount} questions
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.activityText}>Last quiz completed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
              <Text style={styles.activityText}>New high score achieved</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="people" size={20} color="#3b82f6" />
              <Text style={styles.activityText}>Multiplayer game won</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
    fontFamily: 'Inter-Bold',
  },
  userInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
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
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryQuestionCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  activityCard: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
  },
});

export default HomeScreen;


