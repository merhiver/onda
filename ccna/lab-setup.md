# 실습 환경 설치 안내 (Windows)

## 권장 순서

1. **Packet Tracer를 먼저 설치합니다 (1주차).** CCNA 설정 실습 대부분이 Packet Tracer로 가능합니다. Simulation 모드에서는 패킷이 장비를 하나씩 지날 때마다 헤더가 어떻게 바뀌는지 볼 수 있습니다.
2. **GNS3는 2~3주차에 설치합니다.** Wireshark로 실제 패킷을 캡처해 볼 때 필요합니다. 설치에 시간이 꽤 걸리니 공부 시간이 아닌 여유 시간에 하길 권합니다.

---

## 1. Cisco Packet Tracer

### 설치

1. [Cisco Networking Academy](https://www.netacad.com)에 무료로 가입합니다.
2. 로그인한 뒤 **Resources → Packet Tracer 다운로드** 메뉴에서 Windows 64-bit 설치 파일을 받습니다.
   - 사이트 개편으로 메뉴 위치가 바뀔 수 있습니다. 찾기 어려우면 무료 과정인 *Getting Started with Cisco Packet Tracer*에 등록하면 다운로드 링크가 안내됩니다.
3. 설치 파일을 실행해 기본 옵션으로 설치합니다.
4. 처음 실행할 때 Networking Academy 계정으로 로그인합니다.

### 설치 확인

1. 라우터 `2911` 1대와 스위치 `2960` 1대를 작업 공간에 끌어다 놓습니다.
2. 라우터를 클릭하고 **CLI** 탭을 엽니다. 초기 설정 질문(`Would you like to enter the initial configuration dialog?`)에는 `no`를 입력합니다.
3. 아래 명령을 실행합니다.

```
Router> enable
Router# show version
```

- **정상 결과:** `Cisco IOS Software ... Version 15.x` 형식의 IOS 버전과 장비 모델(`CISCO2911`)이 출력됩니다.

### 알아 둘 점

- Packet Tracer는 실제 장비를 흉내 낸 시뮬레이터입니다. 실제 IOS의 일부 명령과 옵션은 지원하지 않습니다. 수업에서 이런 차이가 있으면 따로 표시합니다.

---

## 2. GNS3

### 요구 사항

- Windows 10/11 64-bit
- BIOS/UEFI에서 CPU 가상화(Intel VT-x 또는 AMD-V) 활성화
- 메모리 16GB 권장 (최소 8GB)

### 설치

1. [GNS3](https://www.gns3.com)에 무료로 가입하고 Windows용 **GNS3 all-in-one** 설치 파일을 받습니다.
2. 설치할 때 **Wireshark**와 **Npcap**을 함께 선택합니다. 패킷 캡처에 필요합니다.
3. **GNS3 VM**을 설치합니다. VMware Workstation, VirtualBox, Hyper-V 중 하나를 사용합니다. IOSv 같은 QEMU 기반 이미지는 GNS3 VM 안에서 실행됩니다.
4. GNS3 VM의 버전은 GNS3 프로그램 버전과 반드시 같아야 합니다.

### Cisco 이미지 (중요)

- GNS3에는 Cisco IOS 이미지가 들어 있지 않습니다.
- 이미지는 반드시 정식 경로로 구해야 합니다. 대표적인 방법은 [Cisco Modeling Labs (CML)](https://developer.cisco.com/modeling-labs/) 구독에 포함된 IOSv(라우터)와 IOSvL2(스위치) 이미지를 쓰는 것입니다. 무료 등급이 있는지와 포함된 이미지는 시점에 따라 다르니 설치할 때 함께 확인합니다.
- Cisco 이미지가 없어도 할 수 있는 실습이 있습니다. GNS3 기본 제공 **VPCS**(가상 PC)와 **Ethernet switch**만으로 ARP와 ICMP 패킷을 Wireshark로 캡처할 수 있습니다.

### 설치 확인

1. VPCS 2대와 Ethernet switch 1대를 연결합니다.
2. 각 VPCS에서 `ip 192.168.1.1/24`와 `ip 192.168.1.2/24`를 입력합니다.
3. 링크를 우클릭해 **Start capture**를 누른 뒤, `ping 192.168.1.2`를 실행합니다.
4. **정상 결과:** Wireshark에 ARP Request/Reply와 ICMP Echo Request/Reply가 보입니다.
