import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getApprovalStatus = () => {
    if (!user.isApproved) {
      return { text: 'Pending Approval', color: '#f59e0b' };
    }
    if (!user.isActive) {
      return { text: 'Inactive', color: '#ef4444' };
    }
    return { text: 'Active', color: '#10b981' };
  };

  const status = getApprovalStatus();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155', '#475569']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>Dr. {user.doctorName}</Text>
          <Text style={styles.userDesignation}>{user.designation}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="medical" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Specialty</Text>
                <Text style={styles.infoValue}>{user.specialty}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="business" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hospital</Text>
                <Text style={styles.infoValue}>{user.hospitalName}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="card" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PMDC Number</Text>
                <Text style={styles.infoValue}>{user.pmdcNumber}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{user.city}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phoneNumber}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color="#0f172a" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{user.totalPoints || 0}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="game-controller" size={24} color="#0f172a" />
              <Text style={styles.statNumber}>{user.gamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{user.correctAnswers || 0}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{user.wrongAnswers || 0}</Text>
              <Text style={styles.statLabel}>Wrong Answers</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="settings" size={20} color="#6b7280" />
              <Text style={styles.actionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="help-circle" size={20} color="#6b7280" />
              <Text style={styles.actionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text style={styles.actionText}>About</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Image
          source={require('../../assets/zeegap.jpeg')}
          style={styles.footerImage}
          resizeMode="contain"
        />
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
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  userDesignation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 2,
    fontFamily: 'Inter-Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f9fafb',
  },
  footerImage: {
    width: 160,
    height: 80,
  },
});

export default ProfileScreen;


