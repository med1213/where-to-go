import { PrismaClient, Role, PlaceStatus, FavoriteType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const LAOS_18_PROVINCES = [
  {
    code: 'VTE',
    nameLo: 'ນະຄອນຫຼວງວຽງຈັນ',
    nameEn: 'Vientiane Capital',
    slug: 'vientiane-capital',
    highlight: 'Pha That Luang, Patuxay, Mekong Promenade',
    districts: [
      { code: '0101', nameLo: 'ຈັນທະບູລີ', nameEn: 'Chanthabouly', slug: 'chanthabouly' },
      { code: '0102', nameLo: 'ສີໂຄດຕະບອງ', nameEn: 'Sikhottabong', slug: 'sikhottabong' },
      { code: '0103', nameLo: 'ໄຊເສດຖາ', nameEn: 'Xaysetha', slug: 'xaysetha' },
      { code: '0104', nameLo: 'ສີສັດຕະນາກ', nameEn: 'Sisattanak', slug: 'sisattanak' },
      { code: '0105', nameLo: 'ນາຊາຍທອງ', nameEn: 'Naxaithong', slug: 'naxaithong' },
      { code: '0106', nameLo: 'ໄຊທານີ', nameEn: 'Xaythany', slug: 'xaythany' },
      { code: '0107', nameLo: 'ຫາດຊາຍຟອງ', nameEn: 'Hadxayfong', slug: 'hadxayfong' },
      { code: '0108', nameLo: 'ສັງທອງ', nameEn: 'Sangthong', slug: 'sangthong' },
      { code: '0109', nameLo: 'ປາກງື່ມ', nameEn: 'Parkngum', slug: 'parkngum' },
    ],
  },
  {
    code: 'LPB',
    nameLo: 'ຫຼວງພະບາງ',
    nameEn: 'Luang Prabang',
    slug: 'luang-prabang',
    highlight: 'Kuang Si Waterfall, UNESCO Old Town, Mount Phousi',
    districts: [
      { code: '0601', nameLo: 'ຫຼວງພະບາງ', nameEn: 'Luang Prabang', slug: 'luang-prabang-dist' },
      { code: '0602', nameLo: 'ຊຽງເງິນ', nameEn: 'Xiengngeun', slug: 'xiengngeun' },
      { code: '0603', nameLo: 'ນານ', nameEn: 'Nan', slug: 'nan' },
      { code: '0604', nameLo: 'ປາກອູ', nameEn: 'Pak Ou', slug: 'pak-ou' },
      { code: '0605', nameLo: 'ນ້ຳບາກ', nameEn: 'Nam Bak', slug: 'nam-bak' },
      { code: '0606', nameLo: 'ງອຍ', nameEn: 'Ngoy', slug: 'ngoy' },
      { code: '0607', nameLo: 'ປາກແຊງ', nameEn: 'Pak Seng', slug: 'pak-seng' },
      { code: '0608', nameLo: 'ໂພນໄຊ', nameEn: 'Phonxay', slug: 'phonxay' },
      { code: '0609', nameLo: 'ຈອມເພັດ', nameEn: 'Chomphet', slug: 'chomphet' },
      { code: '0610', nameLo: 'ວຽງຄຳ', nameEn: 'Viengkham', slug: 'viengkham' },
      { code: '0611', nameLo: 'ພູຄູນ', nameEn: 'Phoukhoune', slug: 'phoukhoune' },
      { code: '0612', nameLo: 'ໂພນທອງ', nameEn: 'Phonthong', slug: 'phonthong' },
    ],
  },
  {
    code: 'VTP',
    nameLo: 'ແຂວງວຽງຈັນ',
    nameEn: 'Vientiane Province',
    slug: 'vientiane-province',
    highlight: 'Vang Vieng karst mountains, Nam Xay, Blue Lagoon, Feuang',
    districts: [
      { code: '1001', nameLo: 'ໂພນໂຮງ', nameEn: 'Phonhong', slug: 'phonhong' },
      { code: '1002', nameLo: 'ທຸລະຄົມ', nameEn: 'Thoulakhom', slug: 'thoulakhom' },
      { code: '1003', nameLo: 'ແກ້ວອຸດົມ', nameEn: 'Keo Oudom', slug: 'keo-oudom' },
      { code: '1004', nameLo: 'ກາສີ', nameEn: 'Kasi', slug: 'kasi' },
      { code: '1005', nameLo: 'ວັງວຽງ', nameEn: 'Vang Vieng', slug: 'vang-vieng' },
      { code: '1006', nameLo: 'ເຟືອງ', nameEn: 'Feuang', slug: 'feuang' },
      { code: '1007', nameLo: 'ຊະນະຄາມ', nameEn: 'Xanakharm', slug: 'xanakharm' },
      { code: '1008', nameLo: 'ແມດ', nameEn: 'Mad', slug: 'mad' },
      { code: '1009', nameLo: 'ຫີນເຫີບ', nameEn: 'Hinhurp', slug: 'hinhurp' },
      { code: '1010', nameLo: 'ວຽງຄຳ', nameEn: 'Viengkham-vtp', slug: 'viengkham-vtp' },
      { code: '1011', nameLo: 'ຮົ່ມ', nameEn: 'Hom', slug: 'hom' },
    ],
  },
  {
    code: 'CPS',
    nameLo: 'ຈໍາປາສັກ',
    nameEn: 'Champasak',
    slug: 'champasak',
    highlight: 'Wat Phou UNESCO, Tad Fane, Tad Yuang, 4000 Islands (Si Phan Don)',
    districts: [
      { code: '1601', nameLo: 'ປາກເຊ', nameEn: 'Pakse', slug: 'pakse' },
      { code: '1602', nameLo: 'ຊະນະສົມບູນ', nameEn: 'Sanasomboun', slug: 'sanasomboun' },
      { code: '1603', nameLo: 'ບາຈຽງຈະເລີນສຸກ', nameEn: 'Bachiangchaleunsook', slug: 'bachiang' },
      { code: '1604', nameLo: 'ປາກຊ່ອງ', nameEn: 'Paksong', slug: 'paksong' },
      { code: '1605', nameLo: 'ປະທຸມພອນ', nameEn: 'Pathoumphone', slug: 'pathoumphone' },
      { code: '1606', nameLo: 'ໂພນທອງ', nameEn: 'Phonthong', slug: 'phonthong-cps' },
      { code: '1607', nameLo: 'ຈຳປາສັກ', nameEn: 'Champasak', slug: 'champasak-dist' },
      { code: '1608', nameLo: 'ສຸຂຸມາ', nameEn: 'Soukhouma', slug: 'soukhouma' },
      { code: '1609', nameLo: 'ມູນລະປະໂມກ', nameEn: 'Mounlapamok', slug: 'mounlapamok' },
      { code: '1610', nameLo: 'ໂຂງ', nameEn: 'Khong (4000 Islands)', slug: 'khong' },
    ],
  },
  {
    code: 'KMU',
    nameLo: 'ຄໍາມ່ວນ',
    nameEn: 'Khammouane',
    slug: 'khammouane',
    highlight: 'Kong Lor Cave 7.5km, Thakhek Loop, Nam Theun',
    districts: [
      { code: '1201', nameLo: 'ທ່າແຂກ', nameEn: 'Thakhek', slug: 'thakhek' },
      { code: '1202', nameLo: 'ມະຫາໄຊ', nameEn: 'Mahaxay', slug: 'mahaxay' },
      { code: '1203', nameLo: 'ໜອງບົກ', nameEn: 'Nongbok', slug: 'nongbok' },
      { code: '1204', nameLo: 'ຫີນບູນ', nameEn: 'Hinboun', slug: 'hinboun' },
      { code: '1205', nameLo: 'ຍົມມະລາດ', nameEn: 'Nhommalath', slug: 'nhommalath' },
      { code: '1206', nameLo: 'ບົວລະພາ', nameEn: 'Bualapha', slug: 'bualapha' },
      { code: '1207', nameLo: 'ນາກາຍ', nameEn: 'Nakai', slug: 'nakai' },
      { code: '1208', nameLo: 'ເຊບັ້ງໄຟ', nameEn: 'Xebangfay', slug: 'xebangfay' },
      { code: '1209', nameLo: 'ໄຊບົວທອງ', nameEn: 'Saybouathong', slug: 'saybouathong' },
      { code: '1210', nameLo: 'ຄູນຄຳ', nameEn: 'Khounkham', slug: 'khounkham' },
    ],
  },
  {
    code: 'SVK',
    nameLo: 'ສະຫວັນນະເຂດ',
    nameEn: 'Savannakhet',
    slug: 'savannakhet',
    highlight: 'That Ing Hang, French colonial quarter, Dinosaur museum',
    districts: [
      { code: '1301', nameLo: 'ໄກສອນ ພົມວິຫານ', nameEn: 'Kaysone Phomvihane', slug: 'kaysone' },
      { code: '1302', nameLo: 'ອຸທຸມພອນ', nameEn: 'Outhoumphone', slug: 'outhoumphone' },
      { code: '1303', nameLo: 'ອາດສະພັງທອງ', nameEn: 'Atsaphangthong', slug: 'atsaphangthong' },
      { code: '1304', nameLo: 'ພິນ', nameEn: 'Phine', slug: 'phine' },
      { code: '1305', nameLo: 'ເຊໂປນ', nameEn: 'Sepon', slug: 'sepon' },
      { code: '1306', nameLo: 'ນອງ', nameEn: 'Nong', slug: 'nong' },
      { code: '1307', nameLo: 'ທ່າປາງທອງ', nameEn: 'Thapangthong', slug: 'thapangthong' },
      { code: '1308', nameLo: 'ສອງຄອນ', nameEn: 'Songkhone', slug: 'songkhone' },
      { code: '1309', nameLo: 'ຈຳພອນ', nameEn: 'Champhone', slug: 'champhone' },
      { code: '1310', nameLo: 'ຊົນນະບູລີ', nameEn: 'Xonbuly', slug: 'xonbuly' },
      { code: '1311', nameLo: 'ໄຊບູລີ', nameEn: 'Xaybuly', slug: 'xaybuly' },
      { code: '1312', nameLo: 'ວິລະບູລີ', nameEn: 'Virabuly', slug: 'virabuly' },
      { code: '1313', nameLo: 'ອາດສະພອນ', nameEn: 'Atsaphone', slug: 'atsaphone' },
      { code: '1314', nameLo: 'ໄຊພູທອງ', nameEn: 'Xayphouthong', slug: 'xayphouthong' },
      { code: '1315', nameLo: 'ພະລານໄຊ', nameEn: 'Phalanxay', slug: 'phalanxay' },
    ],
  },
  {
    code: 'XKH',
    nameLo: 'ຊຽງຂວາງ',
    nameEn: 'Xieng Khouang',
    slug: 'xieng-khouang',
    highlight: 'Plain of Jars UNESCO (ທົ່ງໄຫຫີນ), Phonsavan, Hot Springs',
    districts: [
      { code: '0901', nameLo: 'ແປກ', nameEn: 'Paek', slug: 'paek' },
      { code: '0902', nameLo: 'ຄຳ', nameEn: 'Kham', slug: 'kham' },
      { code: '0903', nameLo: 'ໜອງແຮດ', nameEn: 'Nonghet', slug: 'nonghet' },
      { code: '0904', nameLo: 'ຄູນ', nameEn: 'Khoune', slug: 'khoune' },
      { code: '0905', nameLo: 'ໝອກໃໝ່', nameEn: 'Mokmay', slug: 'mokmay' },
      { code: '0906', nameLo: 'ພູກູດ', nameEn: 'Phoukood', slug: 'phoukood' },
      { code: '0907', nameLo: 'ຜາໄຊ', nameEn: 'Phasay', slug: 'phasay' },
    ],
  },
  {
    code: 'BKO',
    nameLo: 'ບໍ່ແກ້ວ',
    nameEn: 'Bokeo',
    slug: 'bokeo',
    highlight: 'Gibbon Experience treetop zip-lining, Golden Triangle Mekong',
    districts: [
      { code: '0501', nameLo: 'ຫ້ວຍຊາຍ', nameEn: 'Houayxay', slug: 'houayxay' },
      { code: '0502', nameLo: 'ຕົ້ນເຜິ້ງ', nameEn: 'Tonpheung', slug: 'tonpheung' },
      { code: '0503', nameLo: 'ເມິງ', nameEn: 'Meung', slug: 'meung' },
      { code: '0504', nameLo: 'ຜາອຸດົມ', nameEn: 'Pha Oudom', slug: 'pha-oudom' },
      { code: '0505', nameLo: 'ປາກທາ', nameEn: 'Paktha', slug: 'paktha' },
    ],
  },
  {
    code: 'LNT',
    nameLo: 'ຫຼວງນ້ຳທາ',
    nameEn: 'Luang Namtha',
    slug: 'luang-namtha',
    highlight: 'Nam Ha National Biodiversity Reserve, Ethnic Eco-trekking',
    districts: [
      { code: '0301', nameLo: 'ນ້ຳທາ', nameEn: 'Namtha', slug: 'namtha' },
      { code: '0302', nameLo: 'ສິງ', nameEn: 'Sing', slug: 'sing' },
      { code: '0303', nameLo: 'ລອງ', nameEn: 'Long', slug: 'long' },
      { code: '0304', nameLo: 'ວຽງພູຄາ', nameEn: 'Viengphoukha', slug: 'viengphoukha' },
      { code: '0305', nameLo: 'ນາແລ', nameEn: 'Nale', slug: 'nale' },
    ],
  },
  {
    code: 'ODX',
    nameLo: 'ອຸດົມໄຊ',
    nameEn: 'Oudomxay',
    slug: 'oudomxay',
    highlight: 'Chom Ong Cave (16km), Muang La hot mineral springs',
    districts: [
      { code: '0401', nameLo: 'ໄຊ', nameEn: 'Xay', slug: 'xay' },
      { code: '0402', nameLo: 'ຫຼາ', nameEn: 'La', slug: 'la' },
      { code: '0403', nameLo: 'ນາໝໍ້', nameEn: 'Namor', slug: 'namor' },
      { code: '0404', nameLo: 'ງາ', nameEn: 'Nga', slug: 'nga' },
      { code: '0405', nameLo: 'ແບ່ງ', nameEn: 'Beng', slug: 'beng' },
      { code: '0406', nameLo: 'ຮຸນ', nameEn: 'Hoon', slug: 'hoon' },
      { code: '0407', nameLo: 'ປາກແບ່ງ', nameEn: 'Pakbeng', slug: 'pakbeng' },
    ],
  },
  {
    code: 'PSL',
    nameLo: 'ຜົ້ງສາລີ',
    nameEn: 'Phongsaly',
    slug: 'phongsaly',
    highlight: '400-year-old Ancient Tea Tree Forest, Cloud mountains',
    districts: [
      { code: '0201', nameLo: 'ຜົ້ງສາລີ', nameEn: 'Phongsaly', slug: 'phongsaly-dist' },
      { code: '0202', nameLo: 'ໃໝ່', nameEn: 'May', slug: 'may' },
      { code: '0203', nameLo: 'ຂວາ', nameEn: 'Khoua', slug: 'khoua' },
      { code: '0204', nameLo: 'ສຳພັນ', nameEn: 'Samphan', slug: 'samphan' },
      { code: '0205', nameLo: 'ບຸນເໜືອ', nameEn: 'Boun Neua', slug: 'boun-neua' },
      { code: '0206', nameLo: 'ຍອດອູ', nameEn: 'Yot Ou', slug: 'yot-ou' },
      { code: '0207', nameLo: 'ບຸນໃຕ້', nameEn: 'Boun Tay', slug: 'boun-tay' },
    ],
  },
  {
    code: 'HPH',
    nameLo: 'ຫົວພັນ',
    nameEn: 'Houaphanh',
    slug: 'houaphanh',
    highlight: 'Viengxay Revolutionary Cave City, Nam Et-Phou Louey Night Safari',
    districts: [
      { code: '0701', nameLo: 'ຊຳເໜືອ', nameEn: 'Xamneua', slug: 'xamneua' },
      { code: '0702', nameLo: 'ຊຽງຄໍ້', nameEn: 'Xiengkhor', slug: 'xiengkhor' },
      { code: '0703', nameLo: 'ຮ້ຽມ', nameEn: 'Hiam', slug: 'hiam' },
      { code: '0704', nameLo: 'ວຽງໄຊ', nameEn: 'Viengxay', slug: 'viengxay' },
      { code: '0705', nameLo: 'ຊຳໃຕ້', nameEn: 'Xamtay', slug: 'xamtay' },
      { code: '0706', nameLo: 'ສົບເບົາ', nameEn: 'Sop Bao', slug: 'sop-bao' },
      { code: '0707', nameLo: 'ແອດ', nameEn: 'Et', slug: 'et' },
      { code: '0708', nameLo: 'ກວັນ', nameEn: 'Kuan', slug: 'kuan' },
      { code: '0709', nameLo: 'ຊ່ອນ', nameEn: 'Xon', slug: 'xon' },
      { code: '0710', nameLo: 'ສົບຮາວ', nameEn: 'Sobhao', slug: 'sobhao' },
    ],
  },
  {
    code: 'BKX',
    nameLo: 'ບໍລິຄໍາໄຊ',
    nameEn: 'Bolikhamxay',
    slug: 'bolikhamxay',
    highlight: 'Wat Phabath Phonsane, Tad Xai, Nam Kading NBCA',
    districts: [
      { code: '1101', nameLo: 'ປາກຊັນ', nameEn: 'Pakxan', slug: 'pakxan' },
      { code: '1102', nameLo: 'ທ່າພະບາດ', nameEn: 'Thaphabath', slug: 'thaphabath' },
      { code: '1103', nameLo: 'ປາກກະດິງ', nameEn: 'Pakkading', slug: 'pakkading' },
      { code: '1104', nameLo: 'ບໍລິຄັນ', nameEn: 'Borikhane', slug: 'borikhane' },
      { code: '1105', nameLo: 'ຄຳເກີດ', nameEn: 'Khamkheuth', slug: 'khamkheuth' },
      { code: '1106', nameLo: 'ວຽງທອງ', nameEn: 'Viengthong', slug: 'viengthong' },
      { code: '1107', nameLo: 'ໄຊຈຳພອນ', nameEn: 'Xaychamphone', slug: 'xaychamphone' },
    ],
  },
  {
    code: 'SLV',
    nameLo: 'ສາລະວັນ',
    nameEn: 'Salavan',
    slug: 'salavan',
    highlight: 'Tad Lo Waterfalls, Coffee ethnic communities, Bolaven foothills',
    districts: [
      { code: '1401', nameLo: 'ສາລະວັນ', nameEn: 'Salavan', slug: 'salavan-dist' },
      { code: '1402', nameLo: 'ຕະໂອ້ຍ', nameEn: 'Ta Oi', slug: 'ta-oi' },
      { code: '1403', nameLo: 'ຕຸ້ມລານ', nameEn: 'Toumlane', slug: 'toumlane' },
      { code: '1404', nameLo: 'ລະຄອນເພັງ', nameEn: 'Lakhonepheng', slug: 'lakhonepheng' },
      { code: '1405', nameLo: 'ວາປີ', nameEn: 'Vapy', slug: 'vapy' },
      { code: '1406', nameLo: 'ຄົງເຊໂດນ', nameEn: 'Khongxedone', slug: 'khongxedone' },
      { code: '1407', nameLo: 'ເລົ່າງາມ', nameEn: 'Lao Ngam', slug: 'lao-ngam' },
      { code: '1408', nameLo: 'ສະໝ້ວຍ', nameEn: 'Samouay', slug: 'samouay' },
    ],
  },
  {
    code: 'SKG',
    nameLo: 'ເຊກອງ',
    nameEn: 'Sekong',
    slug: 'sekong',
    highlight: 'Tad Faek & Tad Se Noi waterfalls, Dakchung organic coffee',
    districts: [
      { code: '1501', nameLo: 'ລະມາມ', nameEn: 'Lamam', slug: 'lamam' },
      { code: '1502', nameLo: 'ກະເລິມ', nameEn: 'Kaleum', slug: 'kaleum' },
      { code: '1503', nameLo: 'ດາກຈຶງ', nameEn: 'Dakcheung', slug: 'dakcheung' },
      { code: '1504', nameLo: 'ທ່າແຕງ', nameEn: 'Thateng', slug: 'thateng' },
    ],
  },
  {
    code: 'ATP',
    nameLo: 'ອັດຕະປື',
    nameEn: 'Attapeu',
    slug: 'attapeu',
    highlight: 'Nong Fa volcanic crater lake, Tad Saepha, Xe Pian NPA',
    districts: [
      { code: '1701', nameLo: 'ໄຊເສດຖາ', nameEn: 'Saysetha', slug: 'saysetha-atp' },
      { code: '1702', nameLo: 'ສາມັກຄີໄຊ', nameEn: 'Samakkhixay', slug: 'samakkhixay' },
      { code: '1703', nameLo: 'ສະໜາມໄຊ', nameEn: 'Sanamxay', slug: 'sanamxay' },
      { code: '1704', nameLo: 'ສານໄຊ', nameEn: 'Sanxay', slug: 'sanxay' },
      { code: '1705', nameLo: 'ພູວົງ', nameEn: 'Phouvong', slug: 'phouvong' },
    ],
  },
  {
    code: 'XYB',
    nameLo: 'ໄຊຍະບູລີ',
    nameEn: 'Xayabury',
    slug: 'xayabury',
    highlight: 'Elephant Conservation Center, Annual Elephant Festival',
    districts: [
      { code: '0801', nameLo: 'ໄຊຍະບູລີ', nameEn: 'Xayabury', slug: 'xayabury-dist' },
      { code: '0802', nameLo: 'ຄອບ', nameEn: 'Khop', slug: 'khop' },
      { code: '0803', nameLo: 'ຫົງສາ', nameEn: 'Hongsa', slug: 'hongsa' },
      { code: '0804', nameLo: 'ເງິນ', nameEn: 'Ngeun', slug: 'ngeun' },
      { code: '0805', nameLo: 'ຊຽງຮ່ອນ', nameEn: 'Xienghone', slug: 'xienghone' },
      { code: '0806', nameLo: 'ພຽງ', nameEn: 'Phiang', slug: 'phiang' },
      { code: '0807', nameLo: 'ປາກລາຍ', nameEn: 'Parklai', slug: 'parklai' },
      { code: '0808', nameLo: 'ແກ່ນທ້າວ', nameEn: 'Kenethao', slug: 'kenethao' },
      { code: '0809', nameLo: 'ບໍ່ແຕນ', nameEn: 'Botene', slug: 'botene' },
      { code: '0810', nameLo: 'ທົ່ງມີໄຊ', nameEn: 'Thongmyxay', slug: 'thongmyxay' },
      { code: '0811', nameLo: 'ໄຊສະຖານ', nameEn: 'Xaysathan', slug: 'xaysathan' },
    ],
  },
  {
    code: 'XSB',
    nameLo: 'ໄຊສົມບູນ',
    nameEn: 'Xaisomboun',
    slug: 'xaisomboun',
    highlight: 'Phou Bia mountain peak (2,819m highest in Laos), Chao Anouvong cave',
    districts: [
      { code: '1801', nameLo: 'ອານຸວົງ', nameEn: 'Anouvong', slug: 'anouvong' },
      { code: '1802', nameLo: 'ລອງແຈ້ງ', nameEn: 'Longchaeng', slug: 'longchaeng' },
      { code: '1803', nameLo: 'ລອງຊານ', nameEn: 'Longxan', slug: 'longxan' },
      { code: '1804', nameLo: 'ຮົ່ມ', nameEn: 'Hom-xsb', slug: 'hom-xsb' },
      { code: '1805', nameLo: 'ທ່າໂທມ', nameEn: 'Thathom', slug: 'thathom' },
    ],
  },
];

async function main() {
  console.log('Seeding database for "Where to Go in Laos"...');

  // 1. Seed Admin & Test Users
  const passwordHash = await argon2.hash('Admin@123456');
  const userPasswordHash = await argon2.hash('User@123456');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      phoneNumber: '02099999999',
      displayName: 'System Admin (ຜູ້ດູແລລະບົບ)',
      passwordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    },
  });

  const travelerUser = await prisma.user.upsert({
    where: { username: 'somxay' },
    update: {},
    create: {
      username: 'somxay',
      phoneNumber: '02055551234',
      displayName: 'Somxay Laos Explorer (ສົມໄຊ)',
      passwordHash: userPasswordHash,
      role: Role.USER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    },
  });

  console.log(`✓ Admin user: username="admin", phone="02099999999"`);
  console.log(`✓ Traveler user: username="somxay", phone="02055551234"`);

  // 2. Seed 18 Provinces and their Districts
  for (const prov of LAOS_18_PROVINCES) {
    const { districts, ...pData } = prov;
    const provinceRecord = await prisma.province.upsert({
      where: { code: pData.code },
      update: pData,
      create: pData,
    });

    for (const dist of districts) {
      await prisma.district.upsert({
        where: {
          provinceId_slug: {
            provinceId: provinceRecord.id,
            slug: dist.slug,
          },
        },
        update: {
          nameLo: dist.nameLo,
          nameEn: dist.nameEn,
          code: dist.code,
        },
        create: {
          provinceId: provinceRecord.id,
          slug: dist.slug,
          code: dist.code,
          nameLo: dist.nameLo,
          nameEn: dist.nameEn,
        },
      });
    }
  }
  console.log(`✓ Seeded all 18 Provinces and their official Districts in Laos`);

  // 3. Seed Categories
  const categories = [
    {
      name: 'Cafes & Specialty Coffee',
      slug: 'cafes',
      icon: 'coffee',
      description: 'Lao Arabica coffee roasters, French bakeries, and riverside chill-out cafes.',
      sortOrder: 1,
    },
    {
      name: 'Waterfalls & Lagoons',
      slug: 'waterfalls',
      icon: 'waves',
      description: 'Crystal turquoise tiered waterfalls, swimming holes, and emerald cascades.',
      sortOrder: 2,
    },
    {
      name: 'Forest, Nature & Trekking',
      slug: 'forest-nature',
      icon: 'tree',
      description: 'Dense tropical rainforests, National Biodiversity Conservation Areas, and eco-tours.',
      sortOrder: 3,
    },
    {
      name: 'Temples & Cultural Heritage',
      slug: 'culture-temples',
      icon: 'landmark',
      description: 'Ancient Buddhist stupas, UNESCO French colonial architecture, and morning almsgiving.',
      sortOrder: 4,
    },
    {
      name: 'Viewpoints & Karst Peaks',
      slug: 'viewpoints',
      icon: 'mountain',
      description: 'Breathtaking 360-degree panoramic cliff viewpoints and limestone mountain summits.',
      sortOrder: 5,
    },
    {
      name: 'Local Food & Night Markets',
      slug: 'local-markets',
      icon: 'utensils',
      description: 'Traditional Lao street food, fresh produce, sticky rice, and night bazaars.',
      sortOrder: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✓ Seeded ${categories.length} categories`);

  const catWaterfalls = await prisma.category.findUnique({ where: { slug: 'waterfalls' } });
  const catViewpoints = await prisma.category.findUnique({ where: { slug: 'viewpoints' } });
  const catCulture = await prisma.category.findUnique({ where: { slug: 'culture-temples' } });
  const catCafes = await prisma.category.findUnique({ where: { slug: 'cafes' } });

  const provLPB = await prisma.province.findUnique({ where: { code: 'LPB' } });
  const distLPB = await prisma.district.findFirst({ where: { provinceId: provLPB?.id, slug: 'luang-prabang-dist' } });

  const provVTP = await prisma.province.findUnique({ where: { code: 'VTP' } });
  const distVV = await prisma.district.findFirst({ where: { provinceId: provVTP?.id, slug: 'vang-vieng' } });

  const provVTE = await prisma.province.findUnique({ where: { code: 'VTE' } });
  const distXaysetha = await prisma.district.findFirst({ where: { provinceId: provVTE?.id, slug: 'xaysetha' } });

  const provCPS = await prisma.province.findUnique({ where: { code: 'CPS' } });
  const distPaksong = await prisma.district.findFirst({ where: { provinceId: provCPS?.id, slug: 'paksong' } });

  // 4. Seed Sample Places with Province & District relations
  if (catWaterfalls && catViewpoints && catCulture && catCafes) {
    const places = [
      {
        userId: travelerUser.id,
        categoryId: catWaterfalls.id,
        provinceId: provLPB?.id,
        districtId: distLPB?.id,
        title: 'Kuang Si Falls (ຕາດກວາງຊີ)',
        slug: 'kuang-si-falls-luang-prabang',
        description:
          'Kuang Si Falls is a three-tiered waterfall about 29 kilometres south of Luang Prabang. The falls begin in shallow pools atop a steep hillside which lead to the main fall with a 60-metre drop into turquoise blue pools.',
        province: 'Luang Prabang',
        district: 'Luang Prabang',
        address: 'Ban Long, 29 km south of Luang Prabang Old Town',
        latitude: 19.7492,
        longitude: 101.9922,
        priceRange: '$ (25,000 LAK)',
        priceLao: '10,000 LAK',
        priceForeigner: '25,000 LAK ($1.20)',
        openingHours: { monday: '08:00 - 17:30', tuesday: '08:00 - 17:30', weekend: '08:00 - 17:30' },
        contactInfo: { phone: '+856 71 212 487' },
        status: PlaceStatus.APPROVED,
        isFeatured: true,
        favoriteCount: 128,
        commentCount: 2,
        media: [
          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
        ],
      },
      {
        userId: travelerUser.id,
        categoryId: catViewpoints.id,
        provinceId: provVTP?.id,
        districtId: distVV?.id,
        title: 'Nam Xay Viewpoint (ຈຸດຊົມວິວ ນໍ້າໄຊ)',
        slug: 'nam-xay-viewpoint-vang-vieng',
        description:
          'A steep and exhilarating 30-40 minute hike up a limestone karst in Vang Vieng. At the summit, a famous motorcycle mounted on the rocky peak offers iconic 360-degree views of rice paddies and jagged cliffs.',
        province: 'Vientiane Province',
        district: 'Vang Vieng',
        address: 'Road to Blue Lagoon 1, Vang Vieng',
        latitude: 18.9189,
        longitude: 102.4042,
        priceRange: '$ (20,000 LAK)',
        priceLao: '10,000 LAK',
        priceForeigner: '20,000 LAK ($1.00)',
        openingHours: { daily: '06:00 - 18:00' },
        contactInfo: {},
        status: PlaceStatus.APPROVED,
        isFeatured: true,
        favoriteCount: 95,
        commentCount: 1,
        media: ['https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80'],
      },
      {
        userId: travelerUser.id,
        categoryId: catCulture.id,
        provinceId: provVTE?.id,
        districtId: distXaysetha?.id,
        title: 'Pha That Luang (ພຣະທາດຫລວງ)',
        slug: 'pha-that-luang-vientiane',
        description:
          'Pha That Luang is a gold-covered large Buddhist stupa in the center of Vientiane. Generally regarded as the most important national monument in Laos and an official national symbol.',
        province: 'Vientiane Capital',
        district: 'Saysettha',
        address: 'That Luang Village, Vientiane Capital',
        latitude: 17.9767,
        longitude: 102.6364,
        priceRange: '$ (30,000 LAK)',
        priceLao: '5,000 LAK',
        priceForeigner: '30,000 LAK ($1.50)',
        openingHours: { morning: '08:00 - 12:00', afternoon: '13:00 - 16:00' },
        contactInfo: {},
        status: PlaceStatus.APPROVED,
        isFeatured: true,
        favoriteCount: 74,
        commentCount: 1,
        media: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80'],
      },
      {
        userId: travelerUser.id,
        categoryId: catCafes.id,
        provinceId: provLPB?.id,
        districtId: distLPB?.id,
        title: 'Le Banneton Cafe & Bakery',
        slug: 'le-banneton-cafe-luang-prabang',
        description:
          'Renowned French bakery in Luang Prabang Old Town known for world-class croissants, Lao Robusta and Arabica blends, and relaxed outdoor street-side seating facing morning temple processions.',
        province: 'Luang Prabang',
        district: 'Luang Prabang',
        address: 'Sakkaline Road, Ban Vat Sene, Luang Prabang',
        latitude: 19.8967,
        longitude: 102.1433,
        priceRange: '$$',
        priceLao: '25,000 - 60,000 LAK',
        priceForeigner: '25,000 - 60,000 LAK',
        openingHours: { daily: '06:30 - 18:00' },
        contactInfo: { facebook: 'lebanneton.luangprabang' },
        status: PlaceStatus.APPROVED,
        isFeatured: false,
        favoriteCount: 42,
        commentCount: 1,
        media: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80'],
      },
      {
        userId: travelerUser.id,
        categoryId: catWaterfalls.id,
        provinceId: provCPS?.id,
        districtId: distPaksong?.id,
        title: 'Tad Yuang Waterfall (ຕາດເຍືອງ)',
        slug: 'tad-yuang-waterfall-champasak',
        description:
          'Tad Yuang is an impressive twin waterfall plunging 40 meters into a lush jungle gorge in the Bolaven Plateau near Paksong. Renowned for misty rainbows, walking bridges, and cool highland air.',
        province: 'Champasak',
        district: 'Paksong',
        address: 'Km 40, Route 16E, Bolaven Plateau',
        latitude: 15.1764,
        longitude: 106.1388,
        priceRange: '$$ (20,000 LAK)',
        priceLao: '10,000 LAK',
        priceForeigner: '20,000 LAK ($1.00)',
        openingHours: { daily: '08:00 - 17:00' },
        contactInfo: { phone: '+856 31 212 345' },
        status: PlaceStatus.PENDING,
        isFeatured: false,
        favoriteCount: 18,
        commentCount: 0,
        media: ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80'],
      },
    ];

    for (const p of places) {
      const { media, ...placeData } = p;
      const createdPlace = await prisma.place.upsert({
        where: { slug: placeData.slug },
        update: placeData,
        create: placeData,
      });

      await prisma.placeMedia.deleteMany({ where: { placeId: createdPlace.id } });
      for (let i = 0; i < media.length; i++) {
        await prisma.placeMedia.create({
          data: {
            placeId: createdPlace.id,
            url: media[i],
            sortOrder: i,
            isCover: i === 0,
          },
        });
      }

      await prisma.comment.deleteMany({ where: { placeId: createdPlace.id } });
      await prisma.comment.create({
        data: {
          placeId: createdPlace.id,
          userId: admin.id,
          content: 'Amazing place! Definitely visit in the morning around 8:30 AM before tour vans arrive.',
          rating: 5,
        },
      });

      await prisma.favorite.deleteMany({ where: { placeId: createdPlace.id } });
      await prisma.favorite.create({
        data: {
          placeId: createdPlace.id,
          userId: travelerUser.id,
          listType: FavoriteType.WANNA_GO,
          personalNote: 'Must bring waterproof camera and go for a swim!',
        },
      });
    }

    console.log(`✓ Seeded ${places.length} featured places in Laos linked with Province & District relations.`);
  }

  console.log('✓ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
