import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, IconButton, Portal, Dialog } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { mockInvitations, mockNotifications, mockApplications } from '../../constants/mockData';
import { Invitation, Application, ApplicationStatus } from '../../types';
import NotificationsModal from '../../components/NotificationsModal';
import AcceptedBrandDetails from '../../components/AcceptedBrandDetails';

type ListItem = {
  type: 'section_header' | 'invitation' | 'application';
  data?: Invitation | Application;
  sectionTitle?: string;
  sectionDescription?: string;
  sectionIcon?: string;
  sectionIconColor?: string;
};

export default function InvitationsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [acceptedDetailsVisible, setAcceptedDetailsVisible] = useState(false);

  // Tüm verileri tek bir listede birleştir
  const combinedData: ListItem[] = [
    // Özel Davetler Bölümü
    {
      type: 'section_header',
      sectionTitle: 'Özel Davetler',
      sectionDescription: 'Bu kampanyalar özellikle sizin için seçildi. Markalar profilinizi inceleyerek sizi bu kampanyalara davet etti.',
      sectionIcon: 'star',
      sectionIconColor: COLORS.warning,
    },
    // Özel davetler
    ...mockInvitations.map(invitation => ({
      type: 'invitation' as const,
      data: invitation
    })),
    // Başvurularım Bölümü
    {
      type: 'section_header',
      sectionTitle: 'Başvurularım',
      sectionDescription: 'Başvurduğunuz kampanyaların durumlarını takip edin.',
      sectionIcon: 'clipboard-list',
      sectionIconColor: COLORS.primary,
    },
    // Başvurular
    ...mockApplications.map(application => ({
      type: 'application' as const,
      data: application
    }))
  ];

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.success;
      case 'rejected':
        return COLORS.error;
      case 'completed':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'accepted':
        return 'check';
      case 'rejected':
        return 'close';
      case 'completed':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  const getStatusMessage = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'Başvurun markaya ulaştı! 🎉 Şu anda değerlendirme aşamasında. En kısa sürede sana haber vereceğiz.';
      case 'accepted':
        return 'Marketing ekibi seninle en kısa sürede iletişime geçecektir.';
      case 'rejected':
        return 'Başvurun bizi çok mutlu etti. Şimdilik markanın bu kampanya ile ilgili başka planları var. Bizi takip etmeye devam edebilir ve sana en özel kampanyalarda çalışma fırsatı bulabilirsin.';
      case 'completed':
        return 'Kampanya başarıyla tamamlandı.';
      default:
        return 'Başvuru durumu hakkında bilgi alınamadı.';
    }
  };

  const handleDetailsPress = (application: Application) => {
    setSelectedApplication(application);
    if (application.status === 'accepted') {
      setAcceptedDetailsVisible(true);
    } else {
      setDetailsModalVisible(true);
    }
  };

  const renderSectionHeader = (title: string, description: string, icon: string, iconColor: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderContent}>
        <IconButton icon={icon as any} iconColor={iconColor} size={20} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );

  const renderInvitationCard = (invitation: Invitation) => (
    <Card style={styles.invitationCard}>
      <Card.Cover source={{ uri: invitation.campaign?.imageUrl }} style={styles.campaignImage} />
      
      {invitation.isSpecial && (
        <View style={styles.specialTag}>
          <IconButton icon="star" iconColor={COLORS.text} size={16} />
          <Text style={styles.specialText}>Sadece Size Özel</Text>
        </View>
      )}

      <Card.Content style={styles.cardContent}>
        <Text style={styles.campaignTitle}>{invitation.campaign?.title}</Text>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>{invitation.campaign?.brand}</Text>
        </View>
        
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Bütçe</Text>
          <Text style={styles.budgetAmount}>
            {invitation.campaign?.budget.toLocaleString()} {invitation.campaign?.budgetCurrency}
          </Text>
        </View>

        {invitation.campaign?.deadline && (
          <View style={styles.deadlineContainer}>
            <IconButton icon="calendar" iconColor={COLORS.textSecondary} size={16} />
            <Text style={styles.deadlineText}>
              Son Başvuru: {invitation.campaign.deadline.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="text"
            onPress={() => router.push(`/campaign/${invitation.campaignId}`)}
            textColor={COLORS.text}
            style={styles.detailsButton}
            icon="arrow-top-right"
          >
            Detayları Gör
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderApplicationCard = (application: Application) => (
    <Card style={styles.applicationCard}>
      <Card.Cover source={{ uri: application.campaign?.imageUrl }} style={styles.campaignImage} />
      
      <Card.Content style={styles.cardContent}>
        <Text style={styles.campaignTitle}>{application.campaign?.title}</Text>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>{application.campaign?.brand}</Text>
        </View>
        
        <View style={styles.applicationDetails}>
          <View style={styles.dateContainer}>
            <IconButton icon="calendar" iconColor={COLORS.textSecondary} size={16} />
            <Text style={styles.dateText}>
              Başvuru: {application.appliedAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
              <IconButton 
                icon={getStatusIcon(application.status)} 
                iconColor={COLORS.text} 
                size={16} 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
            </View>
          </View>

          <View style={styles.earningContainer}>
            <View style={styles.earningBadge}>
              <Text style={styles.earningAmount}>
                {application.campaign?.budget.toLocaleString()} {application.campaign?.budgetCurrency}
              </Text>
            </View>
          </View>
        </View>

        <Button
          mode="text"
          onPress={() => handleDetailsPress(application)}
          textColor={COLORS.primary}
          style={styles.detailsButton}
          icon={application.status === 'accepted' ? 'account-plus' : 'arrow-top-right'}
        >
          {application.status === 'accepted' ? 'Detayları Tamamla' : 'Detaylar'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'section_header') {
      return renderSectionHeader(
        item.sectionTitle!,
        item.sectionDescription!,
        item.sectionIcon!,
        item.sectionIconColor!
      );
    } else if (item.type === 'invitation') {
      return renderInvitationCard(item.data as Invitation);
    } else {
      return renderApplicationCard(item.data as Application);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.notificationButton}>
            <IconButton
              icon="bell"
              iconColor={COLORS.text}
              size={24}
              onPress={() => setNotificationsVisible(true)}
            />
            {mockNotifications.filter(n => !n.isRead).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {mockNotifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Combined List */}
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz davet veya başvurunuz bulunmuyor.</Text>
          </View>
        }
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      {/* Details Modal */}
      <Portal>
        <Dialog
          visible={detailsModalVisible}
          onDismiss={() => setDetailsModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {selectedApplication?.campaign?.title}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <View style={styles.dialogStatusContainer}>
                <View style={[
                  styles.dialogStatusBadge, 
                  { backgroundColor: selectedApplication ? getStatusColor(selectedApplication.status) : COLORS.textSecondary }
                ]}>
                  <IconButton 
                    icon={selectedApplication ? getStatusIcon(selectedApplication.status) : 'help'} 
                    iconColor={COLORS.text} 
                    size={20} 
                    style={styles.dialogStatusIcon}
                  />
                  <Text style={styles.dialogStatusText}>
                    {selectedApplication ? getStatusText(selectedApplication.status) : 'Bilinmiyor'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.dialogMessage}>
                {selectedApplication ? getStatusMessage(selectedApplication.status) : ''}
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDetailsModalVisible(false)}
              textColor={COLORS.primary}
            >
              Tamam
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Accepted Brand Details Modal */}
      <Modal
        visible={acceptedDetailsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedApplication && (
          <AcceptedBrandDetails
            application={selectedApplication}
            onClose={() => setAcceptedDetailsVisible(false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 30,
    resizeMode: 'contain',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.bold,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  sectionHeader: {
    marginBottom: SIZES.spacing.lg,
    marginTop: SIZES.spacing.lg,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  invitationCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  applicationCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  campaignImage: {
    height: 200,
  },
  specialTag: {
    position: 'absolute',
    top: SIZES.spacing.sm,
    right: SIZES.spacing.sm,
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  specialText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
  },
  cardContent: {
    padding: SIZES.spacing.lg,
  },
  campaignTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD54F',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.spacing.md,
  },
  brandBadgeText: {
    color: '#1A1A2E',
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
  },
  budgetLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  budgetAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  deadlineText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    gap: SIZES.spacing.md,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  applicationDetails: {
    marginBottom: SIZES.spacing.lg,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  dateText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    marginBottom: SIZES.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
  },
  statusIcon: {
    margin: 0,
    marginRight: SIZES.spacing.xs,
  },
  statusText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  earningContainer: {
    marginBottom: SIZES.spacing.sm,
  },
  earningBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    alignSelf: 'flex-start',
  },
  earningAmount: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  emptyText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
  },
  dialogTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  dialogContent: {
    paddingVertical: SIZES.spacing.sm,
  },
  dialogStatusContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  dialogStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
  },
  dialogStatusIcon: {
    margin: 0,
    marginRight: SIZES.spacing.sm,
  },
  dialogStatusText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  dialogMessage: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
  },
});
