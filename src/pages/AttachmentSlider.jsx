import React from "react";
import Slider from "react-slick";

const AttachmentSlider = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <div className="mb-4">
      <Slider {...settings}>
        {attachments.map((img, idx) => (
          <div key={idx} className="px-2">
            <img
              src={img?.url}
              alt={`Attachment ${idx + 1}`}
              className="rounded-lg shadow-md object-cover w-full h-72"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AttachmentSlider;
