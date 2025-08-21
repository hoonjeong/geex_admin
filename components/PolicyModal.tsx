import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

const PolicyModal: React.FC<PolicyModalProps> = ({ open, onClose, type }) => {
  const title = type === 'privacy' ? '개인정보 처리방침' : '이용약관';
  
  const privacyContent = (
    <>
      <Typography variant="h6" gutterBottom>1. 개인정보의 수집 및 이용목적</Typography>
      <Typography paragraph>
        회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>2. 개인정보의 처리 및 보유기간</Typography>
      <Typography paragraph>
        회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>3. 개인정보의 제3자 제공</Typography>
      <Typography paragraph>
        회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>4. 정보주체의 권리·의무 및 행사방법</Typography>
      <Typography paragraph>
        정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
      </Typography>
    </>
  );

  const termsContent = (
    <>
      <Typography variant="h6" gutterBottom>제 1조 (목적)</Typography>
      <Typography paragraph>
        이 약관은 회사가 제공하는 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>제 2조 (정의)</Typography>
      <Typography paragraph>
        "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
        "회원"이란 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>제 3조 (약관의 게시와 개정)</Typography>
      <Typography paragraph>
        회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
        회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
      </Typography>
      
      <Typography variant="h6" gutterBottom>제 4조 (서비스의 제공 및 변경)</Typography>
      <Typography paragraph>
        회사는 회원에게 아래와 같은 서비스를 제공합니다.
        회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스 내용을 게시한 곳에 즉시 공지합니다.
      </Typography>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {type === 'privacy' ? privacyContent : termsContent}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyModal;