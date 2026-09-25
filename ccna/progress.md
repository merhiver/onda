# 학습 진도와 취약점

## 수준 진단 (진행 중)

영역마다 한 문제씩 풀면서 정답 여부, 확신도, 오답 유형을 기록합니다.

| # | 영역 | 주제 | 결과 | 확신도 | 오답 유형 | 비고 |
|---|---|---|---|---|---|---|
| 1 | Network Fundamentals | 패킷 흐름 (L2/L3 주소 변화) | ❌ (A 선택, 정답 B) | 확실 | 개념 부족 | IP가 끝까지 유지된다는 점은 이해함. MAC도 끝까지 유지된다고 오해함 |
| 2 | Network Fundamentals | 서브넷 계산 | ❌ (모름) | 모름 | 개념 부족 (배운 적 없음) | 계산 방법을 처음부터 배워야 함 |
| 3 | Network Access | VLAN / Trunk (802.1Q) | | | | |
| 4 | Network Access | STP | | | | |
| 5 | IP Connectivity | 라우팅 테이블 해석 | | | | |
| 6 | IP Connectivity | OSPF | | | | |
| 7 | IP Services | DHCP / NAT | | | | |
| 8 | Security Fundamentals | ACL | | | | |
| 9 | Security Fundamentals | 802.1X / AAA / Port Security | | | | |
| 10 | Automation | REST API / JSON / 컨트롤러 기반 네트워크 | | | | |

## 취약점

| 우선순위 | 내용 | 근거 |
|---|---|---|
| 높음 | MAC 주소는 구간(hop)마다 바뀐다는 점. 라우터가 L2 헤더를 새로 만든다는 점 | 진단 1번. 확신도가 '확실'인데 틀림 → 고정된 오해 |
| 높음 | 서브넷 계산 (네트워크 주소, 브로드캐스트 주소, 호스트 범위, 호스트 수) | 진단 2번. 배운 적 없음. IP 주소 설계, 라우팅, ACL의 기초라 우선 학습 필요 |

## 오답 기록

| 날짜 | 문제 | 오답 유형 | 원인 | 다시 확인할 날 |
|---|---|---|---|---|
| 2026-09-25 | 진단 1번 (R1–R2 구간 프레임의 주소) | 개념 부족 | MAC 주소도 IP처럼 출발지부터 목적지까지 그대로라고 이해함 | 1회차 수업 (다른 구성도로 다시 확인) |

## 복습 과제

- [ ] Packet Tracer 설치 후 `show version` 결과 확인하기 ([lab-setup.md](lab-setup.md))
