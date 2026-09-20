from unittest.mock import MagicMock, patch

import pytest


def test_get_db_yields_a_session_and_closes_it_after_use():
    from app.core import database

    fake_session = MagicMock()
    with patch.object(database, "SessionLocal", return_value=fake_session):
        gen = database.get_db()
        yielded = next(gen)

        assert yielded is fake_session
        fake_session.close.assert_not_called()

        with pytest.raises(StopIteration):
            next(gen)

        fake_session.close.assert_called_once()


def test_base_supports_declaring_a_mapped_model():
    from sqlalchemy import Integer
    from sqlalchemy.orm import Mapped, mapped_column

    from app.core.database import Base

    class _Probe(Base):
        __tablename__ = "_probe_table"
        id: Mapped[int] = mapped_column(Integer, primary_key=True)

    assert _Probe.__tablename__ == "_probe_table"
