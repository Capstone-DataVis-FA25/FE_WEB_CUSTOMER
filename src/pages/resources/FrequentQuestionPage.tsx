import { useState } from 'react';
import { Plus, MessageCircleQuestion, ArrowRight, BookOpen, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// Import animation components and variants
import {
  motion,
  containerVariants,
  slideVariants,
  scaleVariants,
  cardVariants,
  StaggerContainer,
  StaggerItem,
} from '@/theme/animation';
import { t } from 'i18next';

const faqs = [
  {
    id: '1',
    question: 'Làm thế nào để bắt đầu sử dụng dịch vụ?',
    answer:
      'Để bắt đầu sử dụng dịch vụ của chúng tôi, bạn chỉ cần đăng ký tài khoản miễn phí. Sau khi đăng ký, bạn sẽ nhận được email xác nhận và có thể truy cập vào bảng điều khiển của mình. Từ đó, bạn có thể khám phá các tính năng và bắt đầu tạo dự án đầu tiên của mình chỉ trong vài phút.',
  },
  {
    id: '2',
    question: 'Các gói dịch vụ có những tính năng gì?',
    answer:
      'Chúng tôi cung cấp nhiều gói dịch vụ phù hợp với nhu cầu của bạn. Gói miễn phí bao gồm các tính năng cơ bản, trong khi các gói trả phí cung cấp thêm dung lượng lưu trữ, băng thông không giới hạn, hỗ trợ ưu tiên và các tính năng nâng cao khác. Bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào.',
  },
  {
    id: '3',
    question: 'Tôi có thể hủy đăng ký bất cứ lúc nào không?',
    answer:
      'Có, bạn hoàn toàn có thể hủy đăng ký bất cứ lúc nào mà không mất phí. Nếu bạn hủy trong chu kỳ thanh toán hiện tại, bạn vẫn có thể sử dụng dịch vụ cho đến hết kỳ đã thanh toán. Chúng tôi không tính phí hủy và bạn có thể quay lại bất cứ lúc nào.',
  },
  {
    id: '4',
    question: 'Dữ liệu của tôi có được bảo mật không?',
    answer:
      'Bảo mật dữ liệu là ưu tiên hàng đầu của chúng tôi. Chúng tôi sử dụng mã hóa SSL/TLS cho tất cả các kết nối, lưu trữ dữ liệu trên các máy chủ được bảo mật cao và thực hiện sao lưu định kỳ. Chúng tôi tuân thủ các tiêu chuẩn bảo mật quốc tế và không bao giờ chia sẻ dữ liệu của bạn với bên thứ ba.',
  },
  {
    id: '5',
    question: 'Tôi có thể nhận hỗ trợ kỹ thuật như thế nào?',
    answer:
      'Chúng tôi cung cấp nhiều kênh hỗ trợ khác nhau. Bạn có thể liên hệ qua email, chat trực tuyến hoặc gửi ticket hỗ trợ. Đội ngũ hỗ trợ của chúng tôi làm việc 24/7 và cam kết phản hồi trong vòng 24 giờ. Người dùng gói trả phí sẽ nhận được hỗ trợ ưu tiên với thời gian phản hồi nhanh hơn.',
  },
  {
    id: '6',
    question: 'Có giới hạn về số lượng dự án không?',
    answer:
      'Số lượng dự án bạn có thể tạo phụ thuộc vào gói dịch vụ bạn đang sử dụng. Gói miễn phí cho phép tạo tối đa 3 dự án, trong khi các gói trả phí cung cấp số lượng dự án không giới hạn. Mỗi dự án có thể chứa nhiều tệp và tài nguyên tùy thuộc vào dung lượng lưu trữ của gói.',
  },
];

export default function QAPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string>('');
  const [questionForm, setQuestionForm] = useState({
    name: '',
    email: '',
    subject: '',
    question: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement question submission logic
    console.log('Question submitted:', questionForm);
    setIsModalOpen(false);
    setQuestionForm({ name: '', email: '', subject: '', question: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative py-20 lg:py-32 z-10"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={slideVariants.slideInLeft}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageCircleQuestion className="w-8 h-8 text-white" />
              </div>
            </div>

            <motion.h1
              variants={slideVariants.slideInLeft}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Câu hỏi{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                thường gặp
              </span>
            </motion.h1>

            <motion.p
              variants={slideVariants.slideInLeft}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Tìm câu trả lời cho những câu hỏi phổ biến nhất về dịch vụ của chúng tôi
            </motion.p>

            <motion.div
              variants={slideVariants.slideInLeft}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Đặt câu hỏi mới
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                <BookOpen className="w-5 h-5 mr-2" />
                Hướng dẫn chi tiết
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <StaggerContainer className="mx-auto max-w-4xl">
            {/* FAQ Accordion */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <Accordion
                  type="single"
                  collapsible
                  value={openItem}
                  onValueChange={setOpenItem}
                  className="space-y-6"
                >
                  {faqs.map((faq, index) => (
                    <StaggerItem key={faq.id} delay={index * 0.1}>
                      <AccordionItem
                        value={faq.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 px-6 py-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <AccordionTrigger className="text-left text-lg font-medium hover:no-underline text-foreground">
                          <span className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pl-8 text-base leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </StaggerItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </StaggerContainer>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={cardVariants} whileHover="hover" className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-0 shadow-xl">
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  variants={scaleVariants}
                  className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Users className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Không tìm thấy câu trả lời?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Đặt câu hỏi của bạn và đội ngũ chuyên gia sẽ trả lời sớm nhất có thể
                </p>

                <motion.div
                  variants={slideVariants.slideInBottom}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Đặt câu hỏi mới
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <MessageCircleQuestion className="w-5 h-5 mr-2" />
                    Liên hệ hỗ trợ
                  </Button>
                </motion.div>
              </CardContent>

              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Question Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <MessageCircleQuestion className="w-6 h-6 text-blue-600" />
              Đặt câu hỏi mới
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Gửi câu hỏi của bạn và đội ngũ chuyên gia sẽ trả lời sớm nhất có thể
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('frequentQuestions.nameLabel', 'Full Name *')}
                </Label>
                <Input
                  id="name"
                  value={questionForm.name}
                  onChange={e => setQuestionForm({ ...questionForm, name: e.target.value })}
                  placeholder={t('frequentQuestions.namePlaceholder', 'Enter your full name')}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('frequentQuestions.emailLabel', 'Email *')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={questionForm.email}
                  onChange={e => setQuestionForm({ ...questionForm, email: e.target.value })}
                  placeholder={t('frequentQuestions.emailPlaceholder', 'your@email.com')}
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                {t('frequentQuestions.subjectLabel', 'Subject *')}
              </Label>
              <Input
                id="subject"
                value={questionForm.subject}
                onChange={e => setQuestionForm({ ...questionForm, subject: e.target.value })}
                placeholder={t(
                  'frequentQuestions.subjectPlaceholder',
                  'Brief summary of your question'
                )}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium">
                {t('frequentQuestions.questionLabel', 'Detailed Question *')}
              </Label>
              <Textarea
                id="question"
                value={questionForm.question}
                onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder={t(
                  'frequentQuestions.questionPlaceholder',
                  'Describe your question in detail...'
                )}
                rows={4}
                required
                className="rounded-lg resize-none"
              />
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gửi câu hỏi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
