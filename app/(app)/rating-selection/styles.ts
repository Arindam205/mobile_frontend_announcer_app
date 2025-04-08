import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12
  },
  header: {
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12
  },
  headerContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 0,
    letterSpacing: 1.2
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    marginTop: -4
  },
  frequencyText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#E9D5FF',
    letterSpacing: 2
  },
  mhzText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#E9D5FF',
    marginLeft: 4,
    opacity: 0.9
  },
  stationName: {
    fontSize: 16,
    color: '#FDE68A',
    marginBottom: 10,
    fontWeight: '600'
  },
  headerDescription: {
    fontSize: 16,
    color: '#F3E8FF',
    opacity: 0.9,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.8
  },
  microphoneContainer: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },
  microphoneGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10
  },
  microphoneImage: {
    width: 120,
    height: 120,
    opacity: 0.92,
    transform: [{ rotateZ: '-100deg' }],
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 24
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 24
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay on entire card
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.7,
    paddingBottom: 16, // Add padding at the bottom for better spacing
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16
  },
  modalHeaderSpacer: {
    width: 40
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center'
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingLanguagesContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingLanguagesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  apiErrorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  apiErrorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center'
  },
  languagesList: {
    maxHeight: Dimensions.get('window').height * 0.6
  },
  languagesListContent: {
    flexGrow: 1 // Allow content to grow to fill available space
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    minHeight: 60, // Minimum height to ensure sufficient tap area
  },
  languageOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastLanguageOption: {
    marginBottom: 0,
    paddingBottom: 16,
  },
  selectedLanguageOption: {
    backgroundColor: '#F3F4F6'
  },
  languageText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'normal'
  },
  selectedLanguageText: {
    fontWeight: '600'
  },
  languageMicContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(243, 244, 246, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#6366f1', // Purple-blue border color
  },
  noLanguagesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noLanguagesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  }
});