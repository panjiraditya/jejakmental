from datetime import date, datetime, time


def split_pipe(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split("|") if part.strip()]


WEEKDAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]


def serialize_facility(facility, next_available: date | None = None) -> dict:
    services = split_pipe(facility.services)
    age_groups = split_pipe(facility.age_groups)
    return {
        "id": facility.id,
        "slug": facility.slug,
        "name": facility.name,
        "kind": facility.kind,
        "summary": facility.summary,
        "address": facility.address,
        "district": facility.district,
        "phone": facility.phone,
        "whatsapp": facility.whatsapp,
        "website": facility.website,
        "services": services,
        "age_groups": age_groups,
        "cost_note": facility.cost_note,
        "cost_min": facility.cost_min,
        "cost_max": facility.cost_max,
        "accepts_bpjs": facility.accepts_bpjs,
        "emergency_24h": facility.emergency_24h,
        "online_available": facility.online_available,
        "opening_note": facility.opening_note,
        "online_note": facility.online_note,
        "access_note": facility.access_note,
        "is_verified": facility.is_verified,
        "source_url": facility.source_url,
        "reviewed_on": facility.reviewed_on.date() if isinstance(facility.reviewed_on, datetime) else facility.reviewed_on,
        "next_available": next_available,
    }


def serialize_slot(slot, taken: int = 0) -> dict:
    return {
        "id": slot.id,
        "facility_id": slot.facility_id,
        "weekday": slot.weekday,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "label": slot.label,
        "room": slot.room,
        "capacity": slot.capacity,
        "taken": taken,
        "mode": slot.mode,
        "is_active": slot.is_active,
    }


def parse_hm(value: str) -> time:
    hour, minute = value.split(":")
    return time(int(hour), int(minute))
